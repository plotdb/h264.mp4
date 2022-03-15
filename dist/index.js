(function(){
  var ffmpeg;
  ffmpeg = function(opt){
    opt == null && (opt = {});
    this.inited = false;
    this._init = [];
    this.worker = null;
    this.queue = {
      main: null,
      list: []
    };
    this.evtHandler = {};
    this.workerUrl = opt.worker || "/assets/lib/@plotdb/h264.mp4/main/worker.js";
    this.canvas = document.createElement('canvas');
    return this;
  };
  ffmpeg.prototype = import$(Object.create(Object.prototype), {
    encoding: function(file){
      var fn, p, this$ = this;
      fn = file.name;
      console.log(fn);
      p = new Promise(function(res, rej){
        var fr;
        fr = new FileReader();
        fr.onload = function(){
          return res({
            name: fn,
            data: new Uint8Array(fr.result)
          });
        };
        return fr.readAsArrayBuffer(file);
      });
      return p.then(function(fobj){
        var opt, p;
        opt = {
          arguments: ["-i", fn + ""],
          MEMFS: [fobj],
          TOTAL_MEMORY: 4 * 1024 * 1024 * 1024
        };
        p = !this$.queue.main
          ? Promise.resolve()
          : new Promise(function(res, rej){
            return this$.queue.list.push({
              res: res,
              rej: rej
            });
          });
        return p.then(function(){
          return new Promise(function(res, rej){
            this$.queue.main = {
              res: res,
              rej: rej
            };
            return this$.worker.postMessage(import$({
              type: 'run'
            }, opt));
          });
        });
      });
    },
    on: function(n, cb){
      var this$ = this;
      return (Array.isArray(n)
        ? n
        : [n]).map(function(n){
        var ref$;
        return ((ref$ = this$.evtHandler)[n] || (ref$[n] = [])).push(cb);
      });
    },
    fire: function(n){
      var v, res$, i$, to$, ref$, len$, cb, results$ = [];
      res$ = [];
      for (i$ = 1, to$ = arguments.length; i$ < to$; ++i$) {
        res$.push(arguments[i$]);
      }
      v = res$;
      for (i$ = 0, len$ = (ref$ = this.evtHandler[n] || []).length; i$ < len$; ++i$) {
        cb = ref$[i$];
        results$.push(cb.apply(this, v));
      }
      return results$;
    },
    init: function(){
      var this$ = this;
      return new Promise(function(res, rej){
        if (this$.inited) {
          return res();
        }
        if (this$.worker) {
          this$._init.push({
            res: res,
            rej: rej
          });
        }
        this$.worker = new Worker(this$.workerUrl);
        return this$.worker.onmessage = function(e){
          var msg, ret, p, err, ref$;
          msg = e.data;
          console.log(msg);
          switch (msg.type) {
          case 'ready':
            this$.inited = true;
            res();
            return this$._init.splice(0).map(function(it){
              return it.res();
            });
          case 'stderr':
            if (!this$.queue.main || !/\s*Stream/.exec(msg.data)) {
              return;
            }
            ret = /Video:\s*(\S+)/.exec(msg.data);
            if (!ret || ret[1] !== 'h264') {
              return;
            }
            this$.queue.main.res('h264');
            this$.queue.main = null;
            if (p = this$.queue.list.splice(0, 1)[0]) {
              return p.res('h264');
            }
            break;
          case 'done':
            if (!this$.queue.main) {
              return;
            }
            err = (ref$ = new Error(), ref$.name = 'lderror', ref$.id = 1020, ref$);
            this$.queue.main.rej(err);
            this$.queue.main = null;
            if (!(ret = this$.queue.list.splice(0, 1)[0])) {
              return;
            }
            return ret.rej(err);
          }
        };
      });
    }
  });
  if (typeof module != 'undefined' && module !== null) {
    module.exports = ffmpeg;
  } else if (typeof window != 'undefined' && window !== null) {
    window.ffmpeg = ffmpeg;
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
