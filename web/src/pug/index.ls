<-(->it.apply {}) _
@h264 = new h264!
@h264.init!
  .then ~>
    @view = view = new ldview do
      root: document.body
      action: change: upload: ({node}) ~>
        file = node.files.0
        @h264.check(file)
          .then ->
            console.log \done.
            console.log it
          .catch ->
            console.log "not supported"

