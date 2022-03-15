# @plotdb/h264.mp4

check if a file is encoded in MPEG-4 / H.264.


## Usage

install:

    npm install --save @plotdb/h264.mp4

include and init `h264`:

    codec = new h264 worker-url: ...
    codec.init!
      .then -> codec.check(fileobj)
      .then -> # support
      .catch -> # not support


## License

MIT
