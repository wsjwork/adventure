Tina.Background = function(T) {
  T.Background = T.Entity.extend({
    w: 1280,
    h: 720,
    z: -1,
    wx: 0,
    wy: 0,
    move: {x: 0, y: 0},
    asset: "tina_bg_down.jpg",
    data: 0,
    init: function (ops) {
      this._super(ops);
      //仅用于切割时使用
      this._w = Math.min(this.w,1280);
    },
    render: function (ctx) {
      if (!ctx) {
        ctx = T.ctx;
      }
      var p = this;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.scale(p.scale.x, p.scale.y);
      ctx.globalAlpha = p.alpha;
      if (p.asset) {
        //开始剪的xy,剪多少，放置的xy，放多大  支持3,5，9个参数
        ctx.drawImage(T.getAsset(p.asset),
          this.wx, this.wy ,
          this._w, this.h, 0, 0,1280,720
        );
      }
      ctx.restore();
      this.emit("render", ctx);
    },
    add:function(){
      //自定义方法
    },
    update: function () {
      if (this.move.x != 0) {
        this.wx += this.move.x;
        this.move.x = 0;
      }
      if (this.move.y != 0) {
        this.wy += this.move.y;
        this.move.y = 0;
      }
      if (T.inputs['left']) {
        this.wx -= 10;
      }
      if (T.inputs['right']) {
        this.wx += 10;
      }
      if (T.inputs['up']) {
        this.wy -= 10;
      }
      if (T.inputs['down']) {
        this.wy += 10;
      }
      this.add();
    }
  });
};