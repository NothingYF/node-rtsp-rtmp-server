// Generated by CoffeeScript 1.7.1
(function() {
  var aac, api, logger;

  aac = require('./aac');

  logger = require('./logger');

  api = {
    createSDP: function(opts) {
      var configspec, fmtp, mandatoryOpts, profileLevelId, prop, rtpmap, sdpBody, _i, _len;
      mandatoryOpts = ['username', 'sessionID', 'sessionVersion', 'addressType', 'unicastAddress'];
      if (opts.hasAudio) {
        mandatoryOpts = mandatoryOpts.concat(['audioPayloadType', 'audioEncodingName', 'audioClockRate']);
      }
      if (opts.hasVideo) {
        mandatoryOpts = mandatoryOpts.concat(['videoPayloadType', 'videoEncodingName', 'videoClockRate']);
      }
      for (_i = 0, _len = mandatoryOpts.length; _i < _len; _i++) {
        prop = mandatoryOpts[_i];
        if ((opts != null ? opts[prop] : void 0) == null) {
          throw new Error("createSDP: property " + prop + " is required");
        }
      }
      sdpBody = "v=0\no=" + opts.username + " " + opts.sessionID + " " + opts.sessionVersion + " IN " + opts.addressType + " " + opts.unicastAddress + "\ns= \nc=IN " + opts.addressType + " " + opts.unicastAddress + "\nt=0 0\na=sdplang:en\na=range:npt=0.0-\na=control:*\n";
      if (opts.hasAudio) {
        if (opts.audioSpecificConfig != null) {
          configspec = opts.audioSpecificConfig.toString('hex');
        } else if ((opts.audioObjectType != null) && (opts.audioSampleRate != null) && (opts.audioChannels != null)) {
          configspec = new Buffer(aac.createAudioSpecificConfig({
            audioObjectType: opts.audioObjectType,
            samplingFrequency: opts.audioSampleRate,
            channels: opts.audioChannels,
            frameLength: 1024
          }));
          configspec = configspec.toString('hex');
        } else {
          logger.warn("[sdp] warn: audio configspec is not available");
          configspec = null;
        }
        rtpmap = "" + opts.audioPayloadType + " " + opts.audioEncodingName + "/" + opts.audioClockRate;
        if (opts.audioChannels != null) {
          rtpmap += "/" + opts.audioChannels;
        }
        profileLevelId = 1;
        fmtp = "" + opts.audioPayloadType + " profile-level-id=" + profileLevelId + ";mode=AAC-hbr;sizeLength=13;indexLength=3;indexDeltaLength=3";
        if (configspec != null) {
          fmtp += ";config=" + configspec;
        }
        sdpBody += "m=audio 0 RTP/AVP " + opts.audioPayloadType + "\na=rtpmap:" + rtpmap + "\na=fmtp:" + fmtp + "\na=control:trackID=1\n";
      }
      if (opts.hasVideo) {
        fmtp = "" + opts.videoPayloadType + " packetization-mode=1";
        if (opts.videoProfileLevelId != null) {
          fmtp += ";profile-level-id=" + opts.videoProfileLevelId;
        }
        if (opts.videoSpropParameterSets != null) {
          fmtp += ";sprop-parameter-sets=" + opts.videoSpropParameterSets;
        }
        sdpBody += "m=video 0 RTP/AVP " + opts.videoPayloadType + "\na=rtpmap:" + opts.videoPayloadType + " " + opts.videoEncodingName + "/" + opts.videoClockRate + "\na=fmtp:" + fmtp + "\n";
        if ((opts.videoHeight != null) && (opts.videoWidth != null)) {
          sdpBody += "a=cliprect:0,0," + opts.videoHeight + "," + opts.videoWidth + "\na=framesize:" + opts.videoPayloadType + " " + opts.videoWidth + "-" + opts.videoHeight + "\n";
        }
        if (opts.videoFrameRate != null) {
          sdpBody += "a=framerate:" + opts.videoFrameRate + "\n";
        }
        sdpBody += "a=control:trackID=2\n";
      }
      return sdpBody.replace(/\n/g, "\r\n");
    },
    parse: function(str) {
      var attrKey, attrValue, currentMedia, key, line, match, obj, origParams, pair, params, session, target, value, _i, _j, _len, _len1, _ref, _ref1;
      session = {};
      origParams = [];
      currentMedia = null;
      _ref = str.split(/\r?\n/);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        if (line !== '') {
          if ((match = /^(.*?)=(.*)$/.exec(line)) != null) {
            key = match[1];
            value = match[2];
          } else {
            throw new Error("Invalid SDP line: " + line);
          }
          obj = {};
          obj[key] = value;
          origParams.push(obj);
          switch (key) {
            case 'v':
              session.version = value;
              break;
            case 'o':
              params = value.split(/\s+/);
              if (params.length > 6) {
                logger.warn("SDP: Origin has too many parameters: " + line);
              }
              session.origin = {
                username: params[0],
                sessId: params[1],
                sessVersion: params[2],
                nettype: params[3],
                addrtype: params[4],
                unicastAddress: params[5]
              };
              break;
            case 's':
              session.sessionName = value;
              break;
            case 'c':
              params = value.split(/\s+/);
              if (params.length > 3) {
                logger.warn("SDP: Connection Data has too many parameters: " + line);
              }
              session.connectionData = {
                nettype: params[0],
                addrtype: params[1],
                connectionAddress: params[2]
              };
              break;
            case 't':
              params = value.split(/\s+/);
              if (params.length > 2) {
                logger.warn("SDP: Timing has too many parameters: " + line);
              }
              session.timing = {
                startTime: params[0],
                stopTime: params[1]
              };
              break;
            case 'a':
              target = currentMedia != null ? currentMedia : session;
              if (target.attributes == null) {
                target.attributes = {};
              }
              if ((match = /^(.*?):(.*)$/.exec(value)) != null) {
                attrKey = match[1];
                attrValue = match[2];
                target.attributes[attrKey] = attrValue;
                if (attrKey === 'rtpmap') {
                  if ((match = /\d+\s+.*?\/(\d+)(?:\/(\d+))?/.exec(attrValue)) != null) {
                    target.clockRate = parseInt(match[1]);
                    if (match[2] != null) {
                      target.audioChannels = parseInt(match[2]);
                    }
                  }
                } else if (attrKey === 'fmtp') {
                  if ((match = /^\d+\s+(.*)$/.exec(attrValue)) != null) {
                    target.fmtpParams = {};
                    _ref1 = match[1].split(/;\s*/);
                    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                      pair = _ref1[_j];
                      if ((match = /^(.*?)=(.*)$/.exec(pair)) != null) {
                        target.fmtpParams[match[1].toLowerCase()] = match[2];
                      }
                    }
                  }
                }
              } else {
                target.attributes[value] = true;
              }
              break;
            case 'm':
              params = value.split(/\s+/);
              currentMedia = {
                media: params[0],
                port: params[1],
                proto: params[2],
                fmt: params[3]
              };
              if ((currentMedia.proto === 'RTP/AVP') || (currentMedia.proto === 'RTP/SAVP')) {
                currentMedia.fmt = parseInt(currentMedia.fmt);
              }
              if (params.length >= 5) {
                currentMedia.others = params[4];
              }
              if (session.media == null) {
                session.media = [];
              }
              session.media.push(currentMedia);
              break;
            case 'b':
              params = value.split(':');
              if (params.length > 2) {
                logger.warn("SDP: Bandwidth has too many parameters: " + line);
              }
              target = currentMedia != null ? currentMedia : session;
              target.bandwidth = {
                bwtype: params[0],
                bandwidth: params[1]
              };
              break;
            default:
              logger.warn("Unknown (not implemented) SDP: " + line);
          }
        }
      }
      return session;
    }
  };

  module.exports = api;

}).call(this);