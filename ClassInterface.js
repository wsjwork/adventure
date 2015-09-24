/**
 * Created by Administrator on 2015/8/30.
 */
var Adventure = function (T) {
  var C = {};
  //警告状态
  C.notice_status = 0;
  C.Weapon = T.Entity.extend({
    w: 130,
    h: 130,
    center:{x:40,y:96},
    x:-130,
    y:-130,
    z:98,
    status:0,
    init: function (ops) {
      this.setAnimSheet("weapon","weapon");
      this.merge("frameAnim");
      this._super(ops);
    },
    idle:function(){
      this.play("weapon_idle");
    },
    attack: function(){
      this.status = 1;
      this.play("weapon_attack");

    },
    update: function (dt) {
      if(this.status==0){
        this.idle();
      }
      console.log(this.x+"   "+this.y);
      this._super(dt);
    }
  });
  C.Foe1 = T.Entity.extend({
    x: 0,
    y: 0,
    z: 100,
    w: 92,
    h: 68,
    _xs: 1,
    _ys: 1,
    xs: 0,
    ys: 0,
    center: {x: 46, y: 34},
    hp: 100,
    speed: 20,
    rate: 1 / 5,
    att_time: 0,
    background: null,
    sheet: null,
    sprite: null,
    status: 0,
    init: function (ops) {
      this._super(ops);
      if (ops && ops.player && ops.background) {
        this.player = ops.player;
        this.background = ops.background;
      }
      this.merge("frameAnim");
      this.scale.x = -1;
    },
    setPlayer: function (player) {
      this.player = player;
    },
    setBackground: function (background) {
      this.background = background;
    },
    attack: function () {
      this.play("foe_attack");
    },
    run: function () {
      this.play("foe_run");
    },
    update: function (dt) {

      if (this.background.move.x != 0) {
        this.x -= this.background.move.x;
      }
      //foe应该向什么方向走才能找到player
      this.status = F.position_judge(this.player, this);
      //是否产生碰撞
      if (this.status > 0 && this.att_time-- < 0) {
        this.att_time = 60;
        this.attack();
        this.xs = 0;
        this.ys = 0;
        //没有碰撞就寻找玩家
      }else{
        F.searchPlayer(this.player, this);
      }
      if (this.xs || this.ys) {
        this.run();
      }
      if (this.xs < 0) {
        this.scale.x = -1;
      } else if (this.xs > 0) {
        this.scale.x = 1;
      }
      this.x += this.xs;
      this.y += this.ys;
      if (this.x < 0) {
        this.x = 1290;
        this.speed = Math.floor(Math.random() * 60) + 40;
        this.rate = 2 / this.speed;
      }
      this._super(dt);
    }
  });
  C.Foe2 = T.Entity.extend({
    x: 0,
    y: 0,
    z: 100,
    w: 92,
    h: 68,
    center: {x: 46, y: 34},
    speed: 20,
    rate: 1 / 5,
    att_time: 0,
    background: null,
    init: function (ops) {
      this._super(ops);
      if (ops && ops.player && ops.background) {
        this.player = ops.player;
        this.background = ops.background;
      }
      this.merge("frameAnim");
      this.scale.x = -1;
    },
    setPlayer: function (player) {
      this.player = player;
    },
    setBackground: function (background) {
      this.background = background;
    },
    attack: function () {
      this.play("foe2_attack");
    },
    update: function (dt) {
      if (this.background.move.x != 0) {
        this.x -= this.background.move.x;
      }
      //if (kill(this.player.x - 14, this.player.y - 14, this.player.x + 14, this.player.y + 14, this.x - 33, this.y - 25, this.x + 33, this.y + 25) && this.att_time-- < 0 && this.player.hp > 0) {
      //  this.att_time = 50;
      //  this.attack();
      //} else if (this.att_time-- < 0) {
      //  this.play("foe2_run", 0, rate = 5 / this.speed);
      //  this.x += this.speed * dt;
      //}
      if (this.x > 1280) {
        this.x = -100;
        this.speed = Math.floor(Math.random() * 60) + 40;
        this.rate = 2 / this.speed;
      }
      this._super(dt);
    }
  });
  C.Background = T.Background.extend({
    next_foe: 1,
    add: function () {
      if (F.addFoe(this.data, this.wx, this.next_foe)) {
        this.addFoe(F.addFoe(this.data, this.wx, this.next_foe));
      }
    },
    addFoe: function (i) {
      switch (i) {
        case 1:
          var foe1 = new C.Foe1({
            x: Math.floor(Math.random() * 100) + 1280,
            y: Math.floor(Math.random() * 400) + 320,
            z: Math.floor(Math.random() * 400) + 320,
            player: F.findPlayer(this.parent, C.Player),
            background: this,
            speed: Math.floor(Math.random() * 10) + 20,
            rate: this.speed,
            sheet: 'foe1',
            sprite: 'wsj_foe1'
          });
          //foe1.setAnimSheet('foe1','wsj_foe1');
          this.parent.add(foe1);
          break;
        case 2:

          break;
        default :
          console.log("BACKGROUND　ADD ERROR");
          break;
      }
      this.next_foe++;
    }
  });
  //购买物品调用
  C.BuyInterface = T.Entity.extend({
    content: "确认购买",
    init: function (item_asset) {
      this.on('added', function () {
        this.parent.add(new C.Notice(this.content, function () {
          console.log("购买了" + item_asset.id + ",花了" + item_asset.value + "金币");
          json.knapsack.money -= item_asset.value;
          C.tidyKnapsack('add', item_asset.id);
        }, function () {
          console.log("click no button");
        }));
      });
    }
  });
  //背景图的显示
  //C.background = T.Entity.extend({
  //
  //  w: 1280,
  //  h: 720,
  //  z: -1,
  //  wx: 500,
  //  wy: 720,
  //  move: {x: 0, y: 0},
  //  asset: "tina_bg_down.jpg",
  //  init: function (ops) {
  //    this._super(ops);
  //  },
  //  render: function (ctx) {
  //    if (!ctx) {
  //      ctx = T.ctx;
  //    }
  //    var p = this;
  //    ctx.save();
  //    ctx.translate(p.x, p.y);
  //    ctx.rotate(p.rotation * Math.PI / 180);
  //    ctx.scale(p.scale.x, p.scale.y);
  //    ctx.globalAlpha = p.alpha;
  //    if (p.sheet) {
  //      var sheet = this.getSheet();
  //      if (sheet)
  //        sheet.render(ctx, -p.center.x, -p.center.y, p.frame, p.w, p.h);
  //    } else if (p.asset) {
  //      //开始剪的xy,剪多少，放置的xy，放多大s
  //      ctx.drawImage(T.getAsset(p.asset),
  //        this.wx - 500, this.wy - 720,
  //        this.w, this.h, 0, 0,1280,720
  //      );
  //    }
  //    console.log(this.wx+" "+this.wy);
  //    ctx.restore();
  //    this.emit("render", ctx);
  //  },
  //  update: function () {
  //    if (this.move.x != 0) {
  //      this.wx += this.move.x;
  //      this.move.x = 0;
  //    }
  //    if (this.move.y != 0) {
  //      this.wy += this.move.y;
  //      this.move.y = 0;
  //    }
  //    if (T.inputs['left']) {
  //      this.wx -= 1;
  //    }
  //    if (T.inputs['right']) {
  //      this.wx += 1;
  //    }
  //    if (T.inputs['up']) {
  //      this.wy -= 10;
  //    }
  //    if (T.inputs['down']) {
  //      this.wy += 10;
  //    }
  //  }
  //});
  //可一直生成，可使用T.stage.pause来进行判定，需再研究研究
  C.Notice = T.Entity.extend({
    init: function (content, yes_callback, no_callback) {
      this.on('added', function () {
        C.notice_status = 1;
        this.Notice = new T.Sprite({asset: "tina_notice.jpg", w: 200, h: 150, x: 690, y: 280, z: 199});
        this.yes_button = new C.Button({
          w: 80,
          h: 35,
          z: 200,
          x: this.Notice.x + (this.Notice.w / 18),
          y: this.Notice.y + (13 * this.Notice.h / 18),
          center: {x: 0, y: 0},
          asset: "tina_button_yes.jpg"
        });
        this.no_button = new C.Button({
          w: 80,
          h: 35,
          x: this.Notice.x + (5 * this.Notice.w / 9),
          y: this.Notice.y + (13 * this.Notice.h / 18),
          z: 200,
          center: {x: 0, y: 0},
          asset: "tina_button_no.jpg"
        });
        this.close_button = new C.Button({
          w: 35,
          h: 35,
          x: this.Notice.x + (15 * this.Notice.w / 18),
          y: this.Notice.y + (this.Notice.h / 18),
          z: 200,
          center: {x: 0, y: 0},
          asset: "tina_button_close.png"
        });

        this.Notice_content = new T.CText();
        this.Notice_content.x = this.Notice.x + this.Notice.w / 5;
        this.Notice_content.y = this.Notice.y + this.Notice.h / 4;
        this.Notice_content.z = 201;
        this.Notice_content.color = '#fff';
        this.Notice_content.setSize(26);
        this.Notice_content.setText(content);

        this.parent.add(this.Notice_content);
        this.parent.add(this.Notice);
        this.parent.add(this.yes_button);
        this.parent.add(this.no_button);
        this.parent.add(this.close_button);

        this.yes_button.on('down', this, function () {
          this.removeAll();
          if (yes_callback) {
            yes_callback();
          }
          C.notice_status = 0;
        });
        this.no_button.on('down', this, function () {
          this.removeAll();
          if (no_callback) {
            no_callback();
          }
          C.notice_status = 0;
        });
        this.close_button.on('down', this, function () {
          this.removeAll();
          C.notice_status = 0;
        });
      });
    },
    removeAll: function () {
      if (this.Notice) {
        this.parent.remove(this.Notice);
      }
      if (this.yes_button) {
        this.parent.remove(this.yes_button);
      }
      if (this.no_button) {
        this.parent.remove(this.no_button);
      }
      if (this.close_button) {
        this.parent.remove(this.close_button);
      }
      if (this.Notice_content) {
        this.parent.remove(this.Notice_content);
      }
    }
  });
  //商城子项目
  C.Mall_item = T.Entity.extend({
    init: function (id, location, item_asset) {
      this.on("added", function () {
        this.mall_bg = new T.Sprite({
          asset: "tina_mall_item_bg.png",
          w: 430,
          h: 150,
          x: 350 + (location.x * 450) || 0,
          y: 130 + (location.y * 170) || 0,
          z: 51
        });
        this.parent.add(this.mall_bg);
        this.mall_goods = new T.Sprite({
          asset: item_asset.img,
          w: 100,
          h: 100,
          x: 380 + (location.x * 450) || 0,
          y: 155 + (location.y * 170) || 0,
          z: 52
        });
        this.parent.add(this.mall_goods);

        this.mall_name = new T.CText();
        this.mall_name.x = 520 + (location.x * 450) || 0;
        this.mall_name.y = 140 + (location.y * 170) || 0;
        this.mall_name.z = 53;
        this.mall_name.color = '#fa0';
        this.mall_name.setSize(26);
        this.mall_name.setText(item_asset.name);
        this.parent.add(this.mall_name);

        this.mall_value = new T.CText();
        this.mall_value.x = 520 + (location.x * 450) || 0;
        this.mall_value.y = 170 + (location.y * 170) || 0;
        this.mall_value.z = 54;
        this.mall_value.color = '#fa0';
        this.mall_value.setSize(26);
        this.mall_value.setText("金币" + item_asset.value);
        this.parent.add(this.mall_value);


        this.mall_buy = new C.Button({
          w: 100,
          h: 50,
          x: 700 + (location.x * 450) || 0,
          y: 260 + (location.y * 170) || 0,
          z: 55,
          asset: "tina_ready_button_backpack.png"
        });
        this.mall_buy.on('down', this, function () {
          if (!C.notice_status) {
            this.parent.add(new C.BuyInterface(item_asset));
          }
        });
        this.parent.add(this.mall_buy);
      });
    },
    removeAll: function () {
      if (this.mall_bg) {
        this.parent.remove(this.mall_bg);
      }
      if (this.mall_goods) {
        this.parent.remove(this.mall_goods);
      }
      if (this.mall_name) {
        this.parent.remove(this.mall_name);
      }
      if (this.mall_value) {
        this.parent.remove(this.mall_value);
      }
      if (this.mall_buy) {
        this.parent.remove(this.mall_buy);
      }
    },
    update: function () {

    }


  });
  //商城显示
  C.Mall = T.Entity.extend({
    mall_asset: -1,
    mall_array: Array(30),
    page: 0,
    page_last: 0,
    page_max: 0,
    init: function (MallAsset) {
      this.mall_asset = MallAsset;
      //+1是为了补齐0位置上的元素来进行页数判断
      this.page_max = Math.ceil(( this.mall_asset.max + 1) / 6);

      this.on('added', function () {
        for (var i = (this.page * 6); i < (this.page + 1) * 6; i++) {
          if (this.mall_asset[i]) {
            this.parent.add(this.mall_array[i] = new C.Mall_item(i, {
              x: (i % 6) % 2,
              y: parseInt((i % 6) / 2)
            }, this.mall_asset[i]))
          }
        }
        this.left_button = new C.Button({
          w: 25,
          h: 25,
          x: 870,
          y: 712,
          z: 100,
          asset: "tina_left_no.png"
        });
        this.parent.add(this.left_button);
        this.left_button.on('down', this, function () {
          if (this.left_button.asset == "tina_left_yes.png") {
            this.page--;
          }
        });
        this.right_button = new C.Button({
          w: 25,
          h: 25,
          x: 1000,
          y: 712,
          z: 100,
          asset: "tina_right_no.png"
        });
        this.parent.add(this.right_button);
        this.right_button.on('down', this, function () {
          if (this.right_button.asset == "tina_right_yes.png") {
            this.page++;
          }
        });
        this.page_text = new T.CText();
        this.page_text.x = 768;
        this.page_text.y = 660;
        this.page_text.z = 1000;
        this.page_text.color = '#fa0';
        this.page_text.setSize(22);
        this.page_text.setText((this.page + 1) + " " + "/" + " " + this.page_max);
        this.parent.add(this.page_text);
      });


    },
    remove: function () {
      for (var i = 0; i < this.mall_array.length; i++) {
        if (this.mall_array[i] && this.mall_asset[i]) {
          this.mall_array[i].removeAll();
        }
      }
    },
    removeAll: function () {
      for (var i = 0; i < this.mall_array.length; i++) {
        if (this.mall_array[i] && this.mall_asset[i]) {
          this.mall_array[i].removeAll();
        }
      }
      this.parent.remove(this.left_button);
      this.parent.remove(this.right_button);
      this.parent.remove(this.page_text);
    },
    update: function () {
      if (T.inputs['enter']) {
        this.page_last = this.page;
        this.page = 1;
      }
      if (T.inputs['space']) {
        this.page_last = this.page;
        this.page = 0;
      }
      this.page_text.setText((this.page + 1) + " " + "/" + " " + this.page_max);
      if ((this.page + 1) < this.page_max) {
        this.right_button.asset = 'tina_right_yes.png';
      } else {
        this.right_button.asset = 'tina_right_no.png';
      }
      if ((this.page + 1) > 1) {
        this.left_button.asset = 'tina_left_yes.png';
      } else {
        this.left_button.asset = 'tina_left_no.png';
      }
      if (this.page_last != this.page) {
        this.remove();
        for (var i = (this.page * 6); i < (this.page + 1) * 6; i++) {
          if (this.mall_asset[i]) {
            this.parent.add(this.mall_array[i] = new C.Mall_item(i, {
              x: (i % 6) % 2,
              y: parseInt((i % 6) / 2)
            }, this.mall_asset[i]))
          }
        }
        this.page_last = this.page;
      }

    }
  });
  //战斗界面图标显示
  C.Battle = T.Entity.extend({
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
          this.parent.add(new C.ChangeView());
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
  //切换场景时的动画
  C.ChangeView = T.Entity.extend({
    x: 0,
    y: 0,
    z: 101,
    speed: 50,
    rate: 1 / 5,
    w: 1280,
    h: 720,
    init: function (ops) {
      this._super(ops);
      this.merge("frameAnim");
      this.setAnimSheet('changeView', 'changeView');
    },
    change: function () {
      this.play("change");
    },
    update: function (dt) {
      this.change();
      this._super(dt);
    }
  });
  //wsj玩家
  C.Player = T.Entity.extend({
    x: 40,
    y: 500,
    _xs: 4,
    _ys: 3,
    xs: 0,
    ys: 0,
    ready: 0,
    hp: 100,
    level: 1,
    atk: 10,
    def: 10,
    background: null,
    init: function (ops) {
      if (ops&&ops.background) {
        this.background = ops.background;
      }
      if(ops&&ops.weapon){
        this.weapon = ops.weapon;
      }

      this._super(ops);
      this.merge("frameAnim");
      this.setAnimSheet('player', 'player');
    },
    idle: function () {
      this.play("player_idle");

    },
    run: function () {
      this.play("player_run");
    },
    update: function (dt) {
      this.xs = 0;
      this.ys = 0;
      if (this.ready == 0) {
        if (T.inputs['w']) {
          this.scale.y = 1;
          this.accel.y -= this._ys;
        }
        if (T.inputs['s']) {
          this.scale.y = 1;
          this.accel.y += this._ys;
        }
        if (T.inputs['a']) {
          this.scale.x = -1;
          this.accel.x -= this._xs;
        }
        if (T.inputs['d']) {
          this.scale.x = 1;
          this.accel.x += this._xs;
        }
        if(T.inputs['f']){
          this.weapon.attack();
        }
        if (this.accel.x != 0 || this.accel.y != 0) {
          this.run();
        } else {
          this.idle();
        }
        this.xs = this.accel.x;
        this.ys = this.accel.y;
        //取值大于一次行走的速度，避免显示出灰屏
        if ((this.x > (900 - this._xs) && this.accel.x > 0 && this.background.wx < this.background.w - 1280 - this._xs) || (this.x < (300 + this._xs) && this.accel.x < 0 && this.background.wx > this._xs)) {
          this.background.move.x = this.accel.x;
        } else if ((this.x < (1280 - this.w / 2 - this._xs) && this.accel.x > 0) + (this.x > (this.w / 2 + this._xs) && this.accel.x < 0)) {
          this.x += this.xs;
        }
        if ((this.y < (720 - this.h / 2 - this._ys) && this.accel.y > 0) || (this.y > (300 + this.h / 2 + this._ys) && this.accel.y < 0)) {
          this.y += this.ys;
        }
        this.accel.y = 0;
        this.accel.x = 0;

      } else {
        this.run();
      }

      if(this.weapon){
        this.weapon.scale.x = this.scale.x;
        this.weapon.x = this.x ;
        this.weapon.y = this.y;
      }
      this._super(dt);
    }
  });
  //按钮
  C.Button = T.Entity.extend({
    x: 0,
    y: 0,
    w: 320,
    h: 100,
    center: {x: 155, y: 50},
    asset: null,
    init: function (ops) {
      this._super(ops);
    },
    update: function () {

    }
  });
  //按钮栏
  C.ButtonBarMain = T.Entity.extend({
    state: 0,
    move: 0,
    main_info: null,
    init: function (main_content, main_bg, MallAsset, main_info) {
      this.main_info = main_info;
      this.on("added", function () {

        //主页button
        var main_button = new C.Button({
          x: 155,
          y: 50,
          asset: "tina_ready_button_main.png"
        });
        this.parent.add(main_button);
        main_button.on('down', this, function () {
          if (!C.notice_status) {
            if (this.state != 1) {
              if (main_bg && this.parent) {
                this.parent.remove(main_bg);
              }
              if (main_content && this.parent) {
                main_content.removeAll();
              }
              main_bg = new T.Sprite({
                asset: "tina_ready_button_main.png",
                w: 960,
                h: 620,
                x: 320,
                y: 100,
                z: 0
              });
              if (this.parent) {
                this.parent.add(main_bg);
              }
              this.move = 1;
              this.state = 1;
            }
          }
        });
        //战斗button
        var battle_button = new C.Button({
          x: 475,
          y: 50,
          asset: "tina_ready_button_battle.png"
        });
        this.parent.add(battle_button);
        battle_button.on('down', this, function () {
          if (!C.notice_status) {
            if (this.state != 2) {
              if (main_bg && this.parent) {
                this.parent.remove(main_bg);
              }
              if (main_content && this.parent) {
                main_content.removeAll();
              }
              main_bg = new T.Sprite({asset: "tina_bg_game.jpg", w: 960, h: 620, x: 320, y: 100, z: 0});
              main_content = new C.Battle();
              if (this.parent) {
                this.parent.add(main_bg);
                this.parent.add(main_content);
              }
              this.move = 1;
              this.state = 2;
            }
          }
        });
        //背包button
        var backpack_button = new C.Button({
          x: 795,
          y: 50,
          asset: "tina_ready_button_backpack.png"
        });
        this.parent.add(backpack_button);
        backpack_button.on('down', this, function () {
          if (!C.notice_status) {
            if (this.state != 3) {
              if (main_bg && this.parent) {
                this.parent.remove(main_bg);
              }
              if (main_content && this.parent) {
                main_content.removeAll();
              }
              main_bg = new T.Sprite({asset: "tina_backpack.jpg", w: 960, h: 620, x: 320, y: 100, z: 0});
              main_content = new C.EquipHouse();
              if (this.parent) {
                this.parent.add(main_bg);
                this.parent.add(main_content);
              }
              this.move = 1;
              this.state = 3;
            }
          }
        });
        //商城button
        var mall_button = new C.Button({
          x: 1115,
          y: 50,
          asset: "tina_ready_button_mall.png"
        });
        this.parent.add(mall_button);
        mall_button.on('down', this, function () {
          if (!C.notice_status) {
            if (this.state != 4) {
              if (main_bg && this.parent) {
                this.parent.remove(main_bg);
              }
              if (main_content && this.parent) {
                main_content.removeAll();
              }
              main_bg = new T.Sprite({asset: "tina_mall_bg.png", w: 960, h: 620, x: 320, y: 100, z: 0});
              main_content = new C.Mall(MallAsset);

              if (this.parent) {
                //this.parent.add(main_bg);
                this.parent.add(main_content);
              }
              //this.parent.add(new C.Notice( function () {
              //  console.log("get yes");
              //}, function () {
              //  console.log("get no");
              //}));
              this.move = 2;
              this.state = 4;
            }
          }
        });
      });
    },
    move_info: function () {
      if (this.main_info.x > -320 && this.move == 1 && this.main_info.asset == "tina_money.png") {
        this.main_info.x -= 18;
      } else if (this.move == 1 && this.main_info.asset == "tina_money.png") {
        this.move = -1;
        this.main_info.asset = "tina_ready_infor_frame.png";
      }
      if (this.main_info.x < 0 && this.move == -1) {
        this.main_info.x += 18;
      } else if (this.move == -1) {
        this.move = 0;
      }
      if (this.main_info.x > -320 && this.move == 2 && this.main_info.asset == "tina_ready_infor_frame.png") {
        this.main_info.x -= 18;
      } else if (this.move == 2 && this.main_info.asset == "tina_ready_infor_frame.png") {
        this.move = -2;
        this.main_info.asset = "tina_money.png";
      }
      if (this.main_info.x < 0 && this.move == -2) {
        this.main_info.x += 18;
      } else if (this.move == -2) {
        this.move = 0;
      }
    },
    update: function (dt) {
      this.move_info();
      this._super(dt);
    }
  });
  //装备仓库
  C.EquipHouse = T.Entity.extend({
    x: 320, y: 100, z: 0, w: 960, h: 620, asset: null, index: 1, max_index: 1,
    show_number_per_page: 28, /*每页显示道具数量*/ row: 7, detail_showing: false,
    init: function (ops) {
      this.on('added', function () {
        this.prop_total = json.knapsack.prop.length;
        this.initPageupAndPagedown();
        this.initEquipShow();
      });
    },
    //初始化装备显示
    initEquipShow: function () {
      var eh = this;
      this.props = new Array(this.show_number_per_page);
      for (var i = 0; i < this.show_number_per_page; i++) {
        var j = i % this.row;
        var k = parseInt(i / this.row);
        this.props[i] = new C.Equipment({x: 400 + 102 * j, y: 220 + 100 * k, site: i});
        if (i >= this.prop_total) {
          this.props[i].site = null;
        }
        this.parent.add(this.props[i]);
        this.props[i].on('down', function () {//道具点击监听
          if (this.site != null) {
            eh.equip_detail_show = true;
            this.parent.add(eh.equipdetail = new C.EquipmentDetail({site: this.site}));
          }
        });
      }
    },
    //初始化翻页
    initPageupAndPagedown: function () {
      this.max_index = Math.ceil(this.prop_total / this.show_number_per_page);
      if (this.max_index == 0) {
        this.max_index = 1;
      }
      this.shangye = new T.Entity({x: 700, y: 600, z: 1, w: 50, h: 50, asset: 'shangye.png'});
      this.shangye.on('down', this, function () {
        this.pageUp();
      });
      this.parent.add(this.shangye);
      this.xiaye = new T.Entity({x: 800, y: 600, z: 1, w: 50, h: 50, asset: 'xiaye.png'});
      this.xiaye.on('down', this, function () {
        this.pageDown();
      });
      this.parent.add(this.xiaye);
    },
    update: function () {
      this.prop_total = json.knapsack.prop.length;
      this.max_index = Math.ceil(this.prop_total / this.show_number_per_page);
      if (this.max_index == 0) {
        this.max_index = 1;
      }
      if (this.index > this.max_index) {
        this.index--;
      }
      this.updateEquipIcon();
    },
    //上一页
    pageUp: function () {
      if (this.index == 1) {
        console.log('已经是第一页');
        return;
      }
      this.index--;
      this.updateEquipIcon();
    },
    //下一页
    pageDown: function () {
      if (this.index == this.max_index) {
        console.log('已经是最后一页');
        return;
      }
      this.index++;
      this.updateEquipIcon();
    },
    //翻页时调用
    updateEquipIcon: function () {
      var update_number = this.prop_total < this.index * this.show_number_per_page ? this.prop_total % this.show_number_per_page : this.show_number_per_page;
      for (var i = 0; i < update_number; i++) {
        this.props[i].site = (this.index - 1) * this.show_number_per_page + i;
      }
      for (var i = update_number; i < this.show_number_per_page; i++) {
        this.props[i].site = null;
      }
    },
    //移除所有显示的东西
    removeAll: function () {
      var stage = this.parent;
      stage.remove(this.shangye);
      stage.remove(this.xiaye);
      for (var i = 0; i < this.show_number_per_page; i++) {
        stage.remove(this.props[i]);
      }
      if (this.equip_detail_show) {
        this.equipdetail.removeAll();
      }
      stage.remove(this);
    }
  });
  //装备
  C.Equipment = T.Entity.extend({
    w: 85, h: 60, site: null, z: 10, propid: 0,
    init: function (ops) {
      this._super(ops);
      if (json.knapsack.prop[this.site] != null) {
        this.asset = ITEM[json.knapsack.prop[this.site]].asset;
      }
      if (this.propid != 0) {
        this.asset = ITEM[this.propid].asset;
      }
    },
    update: function (dt) {
      if (this.site != null) {
        this.asset = ITEM[json.knapsack.prop[this.site]].asset;
      } else if (this.propid != 0) {
        this.asset = ITEM[this.propid].asset;
      } else {
        this.asset = 'prop_trans.png';
      }
    }
  });
  //装备详情显示
  C.EquipmentDetail = T.Entity.extend({
    asset: 'equipdetail.png', x: 400, y: 200, z: 15, w: 700, h: 400, site: null,
    init: function (ops) {
      this._super(ops);
      this.propid = json.knapsack.prop[this.site];
      this.equipicon = new T.Entity({x: 900, y: 250, z: 20, w: 50, h: 50, asset: ITEM[this.propid].asset});
      this.equip = new T.Entity({x: 550, y: 520, z: 20, w: 100, h: 50, asset: 'zhuangbei_zi.png'});
      if (ITEM[this.propid].type == 2) {
        this.equip.asset = 'shiyong_zi.png';
      }
      this.equip.on('down', this, function () {
        this.removeAll();
      });
      this.sell = new T.Entity({x: 750, y: 520, z: 20, w: 100, h: 50, asset: 'chushou_zi.png'});
      this.sell.on('down', this, function () {
        json.knapsack.money += ITEM[this.propid].price;
        C.tidyKnapsack('delete', this.site);
        this.removeAll();
      });
      this.fanhui = new C.Button({x: 1160, y: 300, z: 20, asset: "chacha.png", w: 50, h: 50});
      this.fanhui.on("down", this, function () {
        this.removeAll();
      });
      this.on('added', function () {
        this.parent.add(this.equipicon);
        this.parent.add(this.equip);
        this.parent.add(this.sell);
        this.parent.add(this.fanhui);
      });
    },
    removeAll: function () {
      this.parent.remove(this.equipicon);
      this.parent.remove(this.equip);
      this.parent.remove(this.sell);
      this.parent.remove(this.fanhui);
      this.parent.remove(this);
    }
  });
  //准备界面人物信息
  C.Information = T.Entity.extend({
    level: 1,
    hp: 0,
    mp: 0,
    atk: 0,
    def: 0,
    speed: 0,
    weapon: null,
    cloth: null,
    trousers: null,
    shoes: null,
    player: null,
    init: function (ops) {
      this.lvt = new T.CText();
      this.lvt.setSize(26);
      this.lvt.x = 20;
      this.lvt.y = 170;
      this.lvt.z = 20;
      this.atkt = new T.CText();
      this.atkt.setSize(26);
      this.atkt.x = 30;
      this.atkt.y = 560;
      this.deft = new T.CText();
      this.deft.setSize(26);
      this.deft.x = 180;
      this.deft.y = 560;
      this.deft.z = 20;
      this.on('added', function () {//再添加4件装备图标****
        this.parent.add(this.lvt);
        this.parent.add(this.atkt);
        this.parent.add(this.deft);
        this.parent.add(this.weapon = new C.Equipment({x: 10, y: 580, propid: json.player.weapen}));
        this.parent.add(this.cloth = new C.Equipment({propid: json.player.cloth}));
        this.parent.add(this.trousers = new C.Equipment({propid: json.player.trousers}));
        this.parent.add(this.shoes = new C.Equipment({propid: json.player.shoes}));
      });
    },
    update: function (dt) {
      this.lvt.setText('LV ' + this.player.level);
      this.atkt.setText('ATK ' + this.player.atk);
      this.deft.setText('DEF ' + this.player.def);
      this.weapon.propid = json.player.weapen;
      this.cloth.propid = json.player.cloth;
      this.trousers.propid = json.player.trousers;
      this.shoes.propid = json.player.shoes;
    }
  });
  //3类流氓
  C.Fireman = T.Entity.extend({
    w: 48, h: 58, x: 300, y: 300, z: 300, center: {x: 24, y: 29},
    actcd: 0, actcding: 0, acting: 0, hp: 100, exe: 0, level: 1, harm: 20, assaultable: true,
    init: function (ops) {
      this._super(ops);
      this.merge("frameAnim");
      this.setAnimSheet('sheet_fireman', 'fireman');
    },
    update: function (dt) {
      this._super(dt);
      if (this.hp > 0) {
        if (this.harmcding) {
          this.harmcding--;
        }
        if (this.acting > 0) {
          this.acting--;
          if (this.acting = 1 && this.harmcding == 0) {
            if (calcDistance(this, this.player) < 40) {
              this.player.hp -= 30;
              this.harmcding = this.harmcd;
              this.parent.add(new C.Bloodshed({x: this.player.x, y: this.player.y, player: this.player}));
              console.log("P1受到牛角猩猩攻击伤血30");
            }
          }
        }
        if (this.player.hp > 0 && calcDistance(this, this.player) < 40) {
          this.play("fire", 3, 1 / 9);
          this.acting = 10;
        } else {
          var direct = judgeDirection(this.player, this);
          if (direct == 1 || direct == 2 || direct == 8) {
            this.y--;
          } else if (direct > 3 && direct < 7) {
            this.y++;
          }
          if (direct > 1 && direct < 5) {
            this.x++;
            this.scale.x = 1;
          } else if (direct > 5) {
            this.x--;
            this.scale.x = -1;
          }
          this.play("run");
        }
      } else {
        this.parent.remove(this);
      }
    },
    fire: function () {
      if (this.actcding)
        return;
      this.play("fire");
      this.acting = 1;
      this.actcding = this.actcd;
    }
  });
  C.Fireball = T.Entity.extend({
    x: 0, y: 0, z: 0, w: 14, h: 14, center: {x: 7, y: 7}, speed: 4, asset: "huoqiu.png", hp: 40, harm: 0,
    update: function (dt) {
      this.x += this.speed;
      if (this.hp) {
        for (var i = 0; i < this.parent.items.length; i++) {
          var temp_item = this.parent.items[i];
          if (temp_item instanceof C.Gorilla || temp_item instanceof C.Zombie) {
            if (hit(this, temp_item)) {
              temp_item.hp -= this.harm;
              this.hp = 0;
              if (temp_item.hp < 1) {
                this.player1.exe += temp_item.exe;
                this.parent.remove(temp_item);
                console.log("P1对怪物造成了" + this.harm + "伤害,获得了" + temp_item.exe + "经验");
              } else {
                console.log("P1对怪物造成了" + this.harm + "伤害");
              }
            }
          }
        }
      }
      if (this.hp < 1) {
        this.parent.remove(this);
      }
      this.hp--;
    }
  });
  C.Bullet = T.Entity.extend({
    x: 0, y: 0, z: 0, w: 6, h: 4, center: {x: 3, y: 2}, speed: 120, asset: "bullet.png", hp: 100, harm: 0,
    init: function (ops) {
      this._super(ops);
      if (ops.player2) {
        this.player2 = ops.player2;
      }
    },
    update: function (dt) {
      this.x += this.speed * dt;
      if (this.hp) {
        for (var i = 0; i < this.parent.items.length; i++) {
          var temp_item = this.parent.items[i];
          if (temp_item instanceof C.Gorilla || temp_item instanceof C.Zombie) {
            if (hit(this, temp_item)) {
              temp_item.hp -= this.harm;
              this.hp = 0;
              if (temp_item.hp < 1) {
                this.player2.exe += temp_item.exe;
                this.player2.score += temp_item.score;
                console.log("P2对怪物造成了" + this.harm + "伤害,获得了" + temp_item.exe + "经验");
              } else {
                console.log("P2对怪物造成了" + this.harm + "伤害");
              }
            }
          }
        }
      }
      if (this.hp < 1) {
        this.parent.remove(this);
      }
      this.hp--;
    }
  });
  C.Gunman = T.Entity.extend({
    w: 24, h: 24, x: 900, y: 300, z: 299, center: {x: 12, y: 12}, hp: 100, maxhp: 100, actcd: 10, acting: 0,
    exe: 0, level: 1, harm: 0, speed: 200, score: 0,
    init: function (ops) {
      this._super(ops);
      this.merge("frameAnim");
      this.setAnimSheet("sheet_gunman", "gunman");
    },
    update: function (dt) {
      if (this.hp > 0) {
        if (this.acting > 0) {
          this.acting--;
        }
        this.level = panShengJi(this.exe);
        this.harm = 20 + 5 * this.level;
        this.maxhp = 80 + 20 * this.level;
        if (T.inputs['num_1']) {
          this.fire();
        }
        if (this.acting == 0 && T.inputs['up'] && this.y > this.h / 2) {
          this.accel.y -= this.speed * dt;
        }
        if (this.acting == 0 && T.inputs['down'] && this.y < 720 - this.h / 2) {
          this.accel.y += this.speed * dt;

        }
        if (this.acting == 0 && T.inputs['left'] && this.x > this.w / 2) {
          this.accel.x -= this.speed * dt;
          this.scale.x = -1;
        }
        if (this.acting == 0 && T.inputs['right'] && this.x < 1280 - this.w / 2) {
          this.accel.x += this.speed * dt;
          this.scale.x = 1;
        }
        if (this.accel.x != 0 || this.accel.y != 0) {
          this.play("run");
        } else {
          this.play("idle");
        }
        this.x += this.accel.x;
        this.y += this.accel.y;
        this.accel.x = 0;
        this.accel.y = 0;
      } else if (this.hp < 0) {
        this.hp = 0;
      }
      this._super(dt);
    },
    fire: function () {
      if (this.acting > 0)
        return;
      gunfire.play();
      var bullet = new C.Bullet({x: this.x, y: this.y + this.w * 1 / 6, harm: this.harm, player2: this});
      if (this.scale.x < 0)
        bullet.speed = -bullet.speed;
      this.parent.add(bullet);
      this.acting = this.actcd;
    }
  });
  C.Swordman = T.Entity.extend({
    x: 350, y: 300, z: 300, speed: 120, w: 54, h: 38, center: {x: 24, y: 16},
    hp: 100, maxhp: 100, harm: 0, level: 1, exe: 0, score: 0, actime: 25, acting: 0, actcd: 30, actcding: 0,
    dead: false, deadtime: 5, moving: false,
    init: function (ops) {
      this._super(ops);
      this.merge("frameAnim");
      this.setAnimSheet('sheet_swordman', 'swordman');
    },
    update: function (dt) {
//      if (this.score > 20) {//过关结算
//        ClearInterface(T);
//      }
      if (this.hp > 0) {
        this.level = levelUp(this.exe);
        this.harm = 20 + 10 * this.level;
        this.maxhp = 70 + 30 * this.level;
        if (this.acting == 0 && T.inputs['w'] && this.y > this.h / 2) {
          this.accel.y -= this.speed * dt;
        }
        if (this.acting == 0 && T.inputs['s'] && this.y < 710 - this.h / 2) {
          this.accel.y += this.speed * dt;
        }
        if (this.acting == 0 && T.inputs['a']) {
          if (this.x > moving_range_left) {
            this.accel.x -= this.speed * dt;
          } else if (world_x > 0) {
            world_x--;
            this.moving = true;
          } else if (this.x > 30) {
            this.accel.x -= this.speed * dt;
          }
          this.scale.x = -1;
        }
        if (this.acting == 0 && T.inputs['d']) {
          if (this.x < moving_range_right) {
            this.accel.x += this.speed * dt;
          } else if (world_x < tollgate_length - 1280) {
            world_x++;
            this.moving = true;
          } else if (this.x < 1250) {
            this.accel.x += this.speed * dt;
          }
          this.scale.x = 1;
        }
        if (T.inputs['j'] && this.acting == 0) {
          this.chop();
        }
        if (T.inputs['k'] && this.acting == 0) {
          this.stab();
        }
        if (this.acting > 0) {
          this.acting--;
          if (this.actcding == 0) {
            for (var i = 0; i < this.parent.items.length; i++) {
              var itemp = this.parent.items[i];
              if (itemp.assaultable && calcDistance(this, itemp) < 55) {
                itemp.hp -= this.harm;
                this.actcding = this.actcd;
                if (itemp.hp < 1) {
                  this.exe += itemp.exe;
                  this.score += itemp.score;
                  console.log("p1对敌人造成了" + this.harm + "伤害,获得了" + itemp.exe + "经验，" + itemp.score + "分");
                }
              }
            }
          } else {
            this.actcding--;
          }
        } else if (this.accel.x != 0 || this.accel.y != 0 || this.moving) {
          this.play("run");
          this.moving = false;
        } else {
          this.play("idle");
        }
        this.x += this.accel.x;
        this.y += this.accel.y;
        this.accel.x = 0;
        this.accel.y = 0;
      } else if (this.hp <= 0) {
        this.hp = 0;
        if (this.dead && this.deadtime == 0) {
          this.play('dead');
          MainInterface(T);
        } else {
          this.play('die');
          this.dead = true;
          this.deadtime--;
        }
      }
      this._super(dt);
    },
    stab: function () {
      this.acting = this.actime;
      this.play('stab');
      sword_sound.play();
    },
    chop: function () {
      this.acting = this.actime;
      this.play("chop");
      sword_sound.play();
    }
  });
  //1类流氓
  C.Gorilla = T.Entity.extend({
    w: 74,
    h: 62,
    center: {x: 37, y: 31},
    hp: 100,
    acting: 0,
    harmcd: 40,
    harmcding: 0,
    exe: 10,
    speed: 60,
    score: 10,
    assaultable: true,
    init: function (ops) {
      this.merge("frameAnim");
      this.setAnimSheet('sheet_gorilla', 'gorilla');
      this._super(ops);
      this.on("added", function () {
        //获取主角
        for (var i = 0; i < this.parent.items.length; i++) {
          if (this.parent.items[i] instanceof C.Swordman) {
            this.player = this.parent.items[i];
            break;
          }
        }
      });
    },
    update: function (dt) {
      if (this.hp > 0) {
        if (this.harmcding) {
          this.harmcding--;
        }
        if (this.acting > 0) {
          this.acting--;
          if (this.acting = 1 && this.harmcding == 0) {
            if (calcDistance(this, this.player) < 40) {
              this.player.hp -= 30;
              this.harmcding = this.harmcd;
              this.parent.add(new C.Bloodshed({x: this.player.x, y: this.player.y, player: this.player}));
              console.log("P1受到牛角猩猩攻击伤血30");
            }
          }
        }
        if (this.player.hp > 0 && calcDistance(this, this.player) < 40) {
          this.play("fire", 3, 1 / 9);
          this.acting = 10;
        } else {
          var direct = judgeDirection(this.player, this);
          if (direct == 1 || direct == 2 || direct == 8) {
            this.y--;
          } else if (direct > 3 && direct < 7) {
            this.y++;
          }
          if (direct > 1 && direct < 5) {
            this.x++;
            this.scale.x = 1;
          } else if (direct > 5) {
            this.x--;
            this.scale.x = -1;
          }
          this.play("run");
        }
      } else {
        this.parent.remove(this);
      }
      this._super(dt);
    }
  });
  C.Zombie = T.Entity.extend({
    w: 26, h: 26, center: {x: 13, y: 13}, hp: 60, acting: 0, actcd: 30, exe: 5, speed: 50, score: 5,
    init: function (ops) {
      this._super(ops);
      this.merge("frameAnim");
      this.setAnimSheet('sheet_zombie', 'zombie');
      this.on("added", function () {
        //获取主角
        for (var i = 0; i < this.parent.items.length; i++) {
          if (this.parent.items[i] instanceof C.Swordman) {
            this.player = this.parent.items[i];
            break;
          }
        }
      });
    },
    update: function (dt) {
      if (this.hp) {
        if (this.x > 1480 || this.x < -200) {
          this.y = parseInt(Math.random() * 500) + 100;
          switch (parseInt(Math.random() * 2)) {
            case 0:
              this.x = Math.random() * 200 - 200;
              this.scale.x = 1;
              this.speed = 50;
              break;
            case 1:
              this.x = Math.random() * 200 + 1280;
              this.scale.x = -1;
              this.speed = -50;
              break;
          }
        }
        if (this.player.hp > 0 && this.acting == 0 && calcDistance(this, this.player) < 5) {
          this.player.hp -= 20;
          this.acting = this.actcd;
          this.parent.add(new C.Bloodshed({player: this.player}));
          console.log("玩家1撞到僵尸伤血20");
        }
        this.x += this.speed * dt;
        this.play("run");
        this._super(dt);
        if (this.acting > 0) {
          this.acting--;
        }
      }
    }
  });
  C.Hud = T.Entity.extend({
    x: 30, y: 10, z: 301,
    init: function (ops) {
      this.player = ops.player;
      this.tooltip = new T.CText();
      this.p1name = new T.CText();
      this.score = new T.CText();
      this.score.color = this.tooltip.color = '#fa0';
      this.p1name.color = this.p2name.color = '#aaf';
      this.tooltip.setSize(26);
      this.score.setSize(26);
      this.p1name.setSize(15);
      this.tooltip.x = 100;
      this.tooltip.y = 10;
      this.score.x = 550;
      this.score.y = 50;
      this.on("added", function () {
        this.parent.add(this.tooltip);
        this.parent.add(this.p1name);
        this.parent.add(this.score);
      });
    },
    update: function (dt) {
      this.isOver();
      this.tooltip.setText("P1:wasd:移动 j、k：攻击       z:暂停      P2：↑←↓→：移动 数字键1：攻击");
      this.score.setText("得分：" + this.player.score);
      this.p1name.x = this.player.x - this.player.w * 0.6;
      this.p1name.y = this.player.y - 35;
      this.p1name.setText("lv" + this.player.level + " " + this.player.hp);
    },
    isOver: function () {
      if (this.player.hp < 1) {//游戏结束
        this.parent.add(new C.Gameover());
      }
    }
  });
  //怪物血量
  C.BloodVolume = T.Entity.extend({
    x: 0, y: 0, z: 301,
    init: function (ops) {
      if (ops.monster) {
        this.monster = ops.monster;
      }
      this.hp = new T.CText();
      this.hp.setSize(15);
      this.hp.color = '#005';
      this.on("added", function () {
        this.parent.add(this.hp);
      });
    },
    update: function (dt) {
      if (this.monster.hp > 0) {
        this.hp.x = this.monster.x - 15;
        this.hp.y = this.monster.y - 35;
        this.hp.setText(this.monster.hp);
      } else {
        this.parent.remove(this.hp);
        this.parent.remove(this.monster);
      }
    }
  });
  //主角流血效果
  C.Bloodshed = T.Entity.extend({
    asset: 'blood.png', hp: 50, x: 0, y: 0, z: 301, w: 150, h: 40, center: {x: 75, y: 20},
    init: function (ops) {
      this._super(ops);
      if (ops.player) {
        this.player = ops.player;
      }
    },
    update: function (dt) {
      this.x = this.player.x;
      this.y = this.player.y;
      if (this.hp-- == 0) {
        this.parent.remove(this);
      }
    }
  });
  //游戏结束界面
  C.Gameover = T.Entity.extend({
    w: 1280, h: 720, asset: "gameover.jpg", x: 0, y: 0, z: 620,
    init: function () {
      window.setTimeout(function () {
        MainInterface(T);
      }, 2000);
    }
  });
  //游戏过关界面
  C.Gameclear = T.Entity.extend({
    x: 0, y: 0, z: 620, w: 1280, h: 720, asset: 'mission_complete.png',
    init: function () {
      window.setTimeout(function () {
        MainInterface(T);
      }, 2000);
    }
  });
  //自动添加敌人
  C.AutoAddEnemy = T.Entity.extend({
    enemy: null, index: 0,
    init: function (ops) {
      this._super(ops);
    },
    update: function () {
      if (this.index < this.enemy.length && world_x >= this.enemy[this.index].wx) {
        switch (this.enemy[this.index].type) {//敌人种类，把所有敌人类都编号
          case 1:
            this.parent.add(new C.Gorilla({x: this.enemy[this.index].x, y: this.enemy[this.index].y}));
            break;
        }
        this.index++;
      }
    }
  });
//检测两物体是否碰撞
  C.hit = function (p0, p1) {
    var result = false;
    p0_x = parseInt(p0.x);
    p0_y = parseInt(p0.y);
    p1_x = parseInt(p1.x);
    p1_y = parseInt(p1.y);
    p0_w = parseInt(p0.w / 2);
    p0_h = parseInt(p0.h / 2);
    p1_w = parseInt(p1.w / 2);
    p1_h = parseInt(p1.h / 2);
    if ((p0_x - p0_w > p1_x - p1_w && p0_x - p0_w < p1_x + p1_w && p0_y - p0_h > p1_y - p1_h && p0_y - p0_h < p1_y + p1_h)
      || (p0_x + p0_w > p1_x - p1_w && p0_x + p0_w < p1_x + p1_w && p0_y - p0_h > p1_y - p1_h && p0_y - p0_h < p1_y + p1_h)
      || (p0_x - p0_w > p1_x - p1_w && p0_x - p0_w < p1_x + p1_w && p0_y + p0_h > p1_y - p1_h && p0_y + p0_h < p1_y + p1_h)
      || (p0_x + p0_w > p1_x - p1_w && p0_x + p0_w < p1_x + p1_w && p0_y + p0_h > p1_y - p1_h && p0_y + p0_h < p1_y + p1_h)) {
      result = true;
    }
    return result;
  };
//求两物体之间的直线距离
  C.calcDistance = function (p0, p1) {
    return parseInt(Math.sqrt(Math.pow(p0.x - p1.x, 2) + Math.pow(p0.y - p1.y, 2)));
  };
//判断p0在p1的什么方向，顺时针8方向分别用1-8表示，1为正上方，2为右上方——0表示两物体重合
  C.judgeDirection = function (p0, p1) {
    var result = null;
    p0_x = parseInt(p0.x);
    p0_y = parseInt(p0.y);
    p1_x = parseInt(p1.x);
    p1_y = parseInt(p1.y);
    p0_w = parseInt(p0.w / 2);
    p0_h = parseInt(p0.h / 2);
    p1_w = parseInt(p1.w / 2);
    p1_h = parseInt(p1.h / 2);
    if (p0_x + p0_w < p1_x - p1_w) {//在左边
      if (p0_y + p0_h < p1_y - p1_h) {
        result = 8;//左上
      } else if (p0_y - p0_h > p1_y + p1_h) {
        result = 6;//左下
      } else {
        result = 7;//正左
      }
    } else if (p0_x - p0_w > p1_x + p1_w) {//在右边
      if (p0_y + p0_h < p1_y - p1_h) {
        result = 2;//右上
      } else if (p0_y - p0_h > p1_y + p1_h) {
        result = 4;//右下
      } else {
        result = 3;//正右
      }
    } else {//同一竖线
      if (p0_y + p0_h < p1_y - p1_h) {
        result = 1;//正上
      } else if (p0_y - p0_h > p1_y + p1_h) {
        result = 5;//正下
      } else {
        result = 0;//重合
      }
    }
    return result;
  };
//升级判定,传入角色当前经验值,返回对应的等级，经验值在升级后不置零
  C.levelUp = function (exe) {
    var level = 1;
    if (exe > 20) {
      level = 2;
    }
    return level;
  };
//整理背包,增加道具、卖出道具
  C.tidyKnapsack = function (operation, site) {
    if (operation == 'delete') {
      //删除道具，售出、穿戴时调用，site传道具在背包中的位置
      json.knapsack.prop.splice(site, 1);
    } else if (operation == 'add') {
      //增加道具，site传增加道具的id
      json.knapsack.prop[json.knapsack.prop.length] = site;
    }
    localStorage.setItem('json', JSON.stringify(json));
  };
//自动寻找主角向其靠近
  C.autoSearchEnemy = function (player, enemy) {
    var direct = judgeDirection(player, enemy);
    if (direct == 1 || direct == 2 || direct == 8) {
      enemy.y--;
    } else if (direct > 3 && direct < 7) {
      enemy.y++;
    }
    if (direct > 1 && direct < 5) {
      enemy.x++;
      enemy.scale.x = 1;
    } else if (direct > 5) {
      enemy.x--;
      enemy.scale.x = -1;
    }
    enemy.play("run");
  };
  C.MText = T.GameObject.extend({
    _text: '',
    _size: '',

    setSize: function (size) {
      this._size = size;
    },
    setText: function (text) {
      this._text = text;
    }
  });
  return C;
};