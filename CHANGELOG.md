Change Log
==========

Version 0.3.2 *(2015-11-01)*
----------------------------

- Changed code over to JavaScript
- Refactoring
- Faster

Version 0.3.1 *(2015-04-28)*
-----------------------------

- RTMP server port is now customizable via config.coffee.
- RTMPServer.start() now takes two arguments.
- Send an EOS (end of stream) signal when uploading is finished.
- Add support for HE-AAC v1/v2.
- Add support for incoming STAP-A RTP packets.
- Add rtmpWaitForKeyFrame to config.coffee.
- Use buffertools module if available.
- Other bug fixes.
