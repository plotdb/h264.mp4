h264 = (opt = {}) ->
  @ <<<
    inited: false, _init: []
    worker: null, queue: {main: null, list: []}
    evt-handler: {}
  @worker-url = opt.worker or "/assets/lib/@plotdb/h264.mp4/main/worker.js"
  @canvas = document.createElement \canvas
  @

h264.prototype = Object.create(Object.prototype) <<< do
  check: (file) ->
    fn = file.name
    p = new Promise (res, rej) ->
      fr = new FileReader!
      fr.onload = -> res {name: fn, data: new Uint8Array fr.result}
      fr.readAsArrayBuffer(file)
    p
      .then (fobj) ~>
        opt = {} <<< {
          arguments: ["-i" "#fn"]
          MEMFS: [fobj]
          TOTAL_MEMORY: 4 * 1024 * 1024 * 1024
        }

        p = if !@queue.main => Promise.resolve!
        else new Promise (res, rej) ~> @queue.list.push {res, rej}
        p
          .then ~> new Promise (res, rej) ~>
            @queue.main = {res, rej}
            @worker.postMessage({type: \run} <<< opt)

  on: (n, cb) -> (if Array.isArray(n) => n else [n]).map (n) ~> @evt-handler.[][n].push cb
  fire: (n, ...v) -> for cb in (@evt-handler[n] or []) => cb.apply @, v
  init: -> new Promise (res, rej) ~>
    if @inited => return res!
    if @worker => @_init.push {res, rej}
    @worker = new Worker(@worker-url)
    @worker.onmessage = (e) ~>
      msg = e.data
      console.log msg
      switch msg.type
      | \ready =>
        @inited = true
        res!
        @_init.splice(0).map -> it.res!
      | \stderr =>
        if !@queue.main or !/\s*Stream/.exec(msg.data) => return
        ret = /Video:\s*(\S+)/.exec(msg.data)
        if !ret or ret.1 != \h264 => return
        @queue.main.res \h264
        @queue.main = null
        if (p = @queue.list.splice 0, 1 .0) => p.res \h264
      | \done =>
        if !@queue.main => return
        err = new Error! <<< {name: \lderror, id: 1020}
        @queue.main.rej err
        @queue.main = null
        if !(ret = @queue.list.splice 0, 1 .0) => return
        ret.rej err

if module? => module.exports = h264
else if window? => window.h264 = h264
