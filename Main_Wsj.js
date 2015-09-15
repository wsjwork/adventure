var browser = navigator.userAgent;
var bro = function () {
  var result = Math.max(browser.indexOf('Android'), browser.indexOf('iPhone'), browser.indexOf('iPad'), browser.indexOf('Linux'), browser.indexOf('Mobile'));
  //if(browser.indexOf('Firefox')>0){
  //    result = -1;
  //}
  return result;

};
var pixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 2;


var info_screen = {w: 1280, h: 720};
var info_screen0 = {w: window.innerWidth, h: window.innerHeight};


//显示比例
var sc_x = info_screen0.w / info_screen.w;
var sc_y = info_screen0.h / info_screen.h;


if (bro() > 0) {
  info_screen = {w: 720, h: 1280};
  info_screen0 = {w: window.innerHeight, h: window.innerWidth};
  sc_x = info_screen0.w / info_screen.h;
  sc_y = info_screen0.h / info_screen.w;
}
//碰撞函数
var impact = function (p_x, p_y, p_xx, p_yy, f_x, f_y, f_xx, f_yy, p_x_speed, p_y_speed, f_x_speed, f_y_speed) {
  var result = 0;
  //不能判定碰撞后相对位置，所以只能判定碰撞后，进行位置判断
  //p_x在f_x和f_xx之间时，不能判定从右边碰撞

  if (p_y > f_y && p_y < f_yy || p_yy > f_y && p_yy < f_yy) {
    if (p_x > f_x && p_x < f_xx || p_xx > f_x && p_xx < f_xx) {

      var r_x_speed = p_x_speed - f_x_speed;
      var r_y_speed = p_y_speed - f_y_speed;
      //console.log("x:"+r_x_speed,"y:"+r_y_speed);
      if (r_x_speed == 0) {
        //只能从上下碰撞,r_x_speed==0
        if (r_y_speed > 0) {
          result = 1;
        } else if (r_y_speed < 0) {
          result = 2;
        } else {
          result = 5;
          //console.log("Impact x and y relative speed error");
        }
      } else if (r_y_speed == 0) {
        //只能从左右进行碰撞,r_y_speed==0
        if (r_x_speed > 0) {
          result = 3;
        } else if (r_x_speed < 0) {
          result = 4;
        } else {
          result = 5;
          //console.log("Impact x and y relative speed error");
        }
      } else if (r_x_speed > 0 && r_y_speed > 0) {
        //这时候只能从目标的左或者上方进行碰撞"↘"
        //交叉相乘，避免分母0
        if ((p_yy - f_y) * r_x_speed < (p_xx - f_x) * r_y_speed) {
          result = 1;
        } else {
          result = 3;
        }

      } else if (r_x_speed < 0 && r_y_speed < 0) {
        //这时候只能从目标的右或者下方进行碰撞"↖"
        if ((f_yy - p_y) * r_x_speed < (f_xx - p_x) * r_y_speed) {
          result = 4;
        } else {
          result = 2;
        }
      }
      else if (r_x_speed > 0 && r_y_speed < 0) {
        //这时候只能从目标的左或者下方进行碰撞"↗"
        if ((p_y - f_yy) * r_x_speed < (p_xx - f_x) * r_y_speed) {
          result = 3;
        } else {
          result = 2;
        }
      }
      else if (r_x_speed < 0 && r_y_speed > 0) {
        //这时候只能从目标的右或者上方进行碰撞"↙"
        if ((p_yy - f_y) * r_x_speed < (p_x - f_xx) * r_y_speed) {
          result = 4;
        } else {
          result = 1;
        }
      }
    }
  }
  return result;
};
//主函数，入口 
var main = function () {

  var T = Tina().requires("Input,Sprites,Scenes,Text,Entities")
    .setup("canvas", {
      bro: bro(),
      width: info_screen0.w, height: info_screen0.h,
      pixelRatio: pixelRatio, scale: {x: sc_x, y: sc_y}
    })
    .controls();
  var MallAsset;
  var C = Adventure(T);
  C.changeView = T.Entity.extend({
    x: 600,
    y: 200,
    z: 99,
    speed: 50,
    rate: 1 / 5,
    w: 280,
    h: 336,
    init: function (ops) {
      this._super(ops);
      this.merge("frameAnim");
      this.setAnimSheet('player', 'player');
    },
    run: function () {
      this.play("player_run");
    },
    update: function (dt) {
      this.run();
      this._super(dt);
    }
  });
  C.back_view = function (background) {
    ctx = T.ctx;
    this.asset = background.asset;
    //开始剪的xy,剪多少，放置的xy，放多大
    ctx.drawImage(this.asset, this.x_start, 0, 1280, 720, 0, 0, 1280, 720);
    //if (!ctx) {
    //  ctx = T.ctx;
    //}
    //ctx.drawImage(asset,
    //  this.frameX(frame), this.frameY(frame),
    //  this.tw, this.th,
    //  x, y,
    //  dw, dh
    //);
  };
  C.background = T.Entity.extend({
    w: 1280,
    h: 720,
    z: -1,
    wx: 500,
    wy: 720,
    asset: "tina_bg_down.jpg",
    init: function (ops) {
      this._super(ops);
    },
    //render: function(ctx){
    //  if (this.active) {
    //    if (!ctx) {
    //      ctx = T.ctx;
    //    }
    //    var p = this;
    //    ctx.save();
    //    ctx.translate(p.x, p.y);
    //    ctx.rotate(p.rotation * Math.PI / 180);
    //    ctx.scale(p.scale.x, p.scale.y);
    //    ctx.globalAlpha = p.alpha;
    //   if (p.asset) {
    //        //开始剪的xy,剪多少，放置的xy，放多大
    //        ctx.drawImage(T.getAsset(p.asset),
    //          this.wx-1000, this.wy-720,
    //          this.wx, this.wy,0,0,1280,720
    //        );
    //    }
    //    ctx.restore();
    //    this.emit("render", ctx);
    //  }
    //},
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
      if (p.sheet) {
        var sheet = this.getSheet();
        if (sheet)
          sheet.render(ctx, -p.center.x, -p.center.y, p.frame, p.w, p.h);
      } else if (p.asset) {
        //开始剪的xy,剪多少，放置的xy，放多大s
        ctx.drawImage(T.getAsset(p.asset),
          this.wx - 500, this.wy - 720,
          this.wx, this.wy, 0, 0, 1280, 720
        );
      }
      ctx.restore();
      this.emit("render", ctx);
    },
    update: function () {
      if (T.inputs['left']) {
        this.wx -= 1;
      }
      if (T.inputs['right']) {
        this.wx += 1;
      }
      if (T.inputs['up']) {
        this.wy -= 10;
      }
      if (T.inputs['down']) {
        this.wy += 10;
      }
    }
  });
  C.battle = T.Entity.extend({
    init: function () {
      this.on('added', function () {
        this.battle_1_1 = new T.Sprite({
          w: 50,
          h: 50,
          x: 340,
          y: 300,
          z: 100,
          asset: 'dj1.png'
        });
        this.parent.add(this.battle_1_1);
        this.battle_1_1.on('down', this, function () {
          this.parent.add(new C.changeView());
          window.setTimeout(function () {
            T.stageScene('battle1_1');
          }, 1500);

        });
        this.battle_1_2 = new T.Sprite({
          w: 50,
          h: 50,
          x: 340,
          y: 350,
          z: 100,
          asset: 'dj2.png'
        });
        this.parent.add(this.battle_1_2);
        this.battle_1_2.on('down', function () {
          T.stageScene('battle1_2');
        });
        this.battle_1_3 = new T.Sprite({
          w: 50,
          h: 50,
          x: 340,
          y: 400,
          z: 100,
          asset: 'dj2.png'
        });
        this.parent.add(this.battle_1_3);
        this.battle_1_3.on('down', function () {
          T.stageScene('battle');
        });
      });
    },
    removeAll: function () {
      this.parent.remove(this.battle_1_1);
      this.parent.remove(this.battle_1_2);
      this.parent.remove(this.battle_1_3);
    },
    update: function () {

    }
  });

  ////(2)场景
  var status;
  //初始场景
  T.scene('main', new T.Scene(function (stage) {
    stage.merge('interactive');
    var main_bg;
    var main_content;
    stage.add(new T.Sprite({asset: "tina_bg_down.jpg", w: 1280, h: 720, z: -1}));
    stage.add(new T.Sprite({asset: "tina_ready_player_frame.png", w: 320, h: 390, x: 0, y: 100}));
    stage.add(new T.Sprite({asset: "tina_ready_infor_frame.png", w: 320, h: 230, x: 0, y: 490}));
    stage.add(new T.Sprite({asset: "tina_ready_bg_frame.png", w: 960, h: 620, x: 320, y: 100, z: 1}));
    main_bg = new T.Sprite({asset: "tina_ready_button_main.png", w: 960, h: 620, x: 320, y: 100, z: 0});
    stage.add(main_bg);
    var ready_player = new C.Player({
      x: 20,
      y: 150,
      z: 99,
      speed: 50,
      rate: 1 / 5,
      w: 280,
      h: 336
    });
    stage.add(ready_player);

    var buttonBar = new C.ButtonBarMain(main_content, main_bg, MallAsset);
    stage.add(buttonBar);
  }, {sort: true}));
  T.scene('battle', new T.Scene(function (stage) {
    stage.merge('interactive');
    //var background = new T.Sprite({asset: "tina_bg_down.jpg", w: 1280, h: 720, z: -1});
    var background = new C.background();
    stage.add(background);
    var player = new C.Player({
      x: 20,
      y: 150,
      z: 99,
      speed: 50,
      rate: 1 / 5,
      w: 60,
      h: 60,
      center: {x: 33, y: 44},
      background: background
    });
    stage.add(player);

  }, {sort: true}));
  T.scene('battle1_1', new T.Scene(function (stage) {
    stage.merge('interactive');
    stage.add(new T.Sprite({asset: "tina_bg_down.jpg", w: 1280, h: 720, z: -1}));
    window.setTimeout(function () {
      T.stageScene('main');
    }, 3000);
  }, {sort: true}));
  T.scene('battle1_2', new T.Scene(function (stage) {
    stage.merge('interactive');
    stage.add(new T.Sprite({asset: "tina_bg_game.jpg", w: 1280, h: 720, z: -1}));
    window.setTimeout(function () {
      T.stageScene('main');
    }, 3000);
  }, {sort: true}));


  ////(3)加载资源
  T.load(["tina_bg_game.jpg", "tina_bg_down.jpg", "tina_ready_player.png",
      "tina_ready_button_main.png", "tina_ready_button_mall.png",
      "tina_ready_button_backpack.png", "tina_ready_button_battle.png",
      "tina_ready_player_frame.png", "tina_ready_infor_frame.png",
      "tina_ready_bg_frame.png", "tina_backpack.jpg", "tina_button_close.png",
      "tina_mall_bg.png", "tina_notice.jpg", "tina_button_no.jpg",
      "tina_button_yes.jpg", "dj1.png", "dj2.png", "tina_mall_item_bg.png",
      "tina_left_no.png", "tina_left_yes.png", "tina_right_no.png", "tina_right_yes.png",
      "tina_player.png",
      "player.json", "enemy.json", "item.json", "mall.json", "wsj_player.json"],
    function () {
      MallAsset = T.getAsset("mall.json");
      T.compileSheets("tina_player.png", "wsj_player.json");
      _.each([
        ["player", {
          player_idle: {frames: [0], rate: 1},
          player_run: {frames: _.range(0, 7), rate: 1 / 10},
          player_fire: {frames: _.range(8, 15), rate: 1 / 30},
          player_up: {frames: _.range(16, 23), rate: 1 / 10},
          player_die: {frames: _.range(24, 34), rate: 1 / 5},
          player_cartridge: {frames: _.range(35, 48), rate: 1 / 5}

        }]
      ], function (anim) {
        T.fas(anim[0], anim[1]);
      });
      window.setTimeout(function () {
        T.stageScene('main');
      }, 300);
      T.input.on('space', function () {
        T.stageScene('battle');
      });
      T.input.on('x', function () {
        T.stageScene('main');
      });
    }
  );
};