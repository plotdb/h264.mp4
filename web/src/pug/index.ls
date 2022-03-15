<-(->it.apply {}) _
@ffmpeg = new ffmpeg!
@ffmpeg.init!
  .then ~>
    @view = view = new ldview do
      root: document.body
      action: change: upload: ({node}) ~>
        file = node.files.0
        @ffmpeg.encoding(file)
          .then ->
            console.log \done.
            console.log it
          .catch ->
            console.log "not supported"

