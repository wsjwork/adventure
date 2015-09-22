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

var json, ITEM, ENEMY;
if (bro() > 0) {
  info_screen = {w: 720, h: 1280};
  info_screen0 = {w: window.screen.height, h: window.screen.width};
  sc_x = info_screen0.w / info_screen.h;
  sc_y = info_screen0.h / info_screen.w;
}

//主函数，入口 
var main = function () {

  var T = Tina().requires("Input,Sprites,Scenes,Text,Entities,Background")
    .setup("canvas", {
      bro: bro(),
      width: info_screen0.w, height: info_screen0.h,
      pixelRatio: pixelRatio, scale: {x: sc_x, y: sc_y}
    })
    .controls();
  var MallAsset;
  var FoeDate;
  var C = Adventure(T);
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

  ////(2)场景
  var status;
  //初始场景
  T.scene('main', new T.Scene(function (stage) {
    stage.merge('interactive');
    var main_info;
    var main_bg;
    var main_content;
    stage.add(new T.Sprite({asset: "tina_bg_down.jpg", w: 1280, h: 720, z: -1}));
    stage.add(new T.Sprite({asset: "tina_ready_player_frame.png", w: 320, h: 390, x: 0, y: 100}));
    stage.add(main_info = new T.Sprite({asset: "tina_ready_infor_frame.png", w: 320, h: 230, x: 0, y: 490,z:-1}));
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
      h: 336,
      ready: 1
    });
    stage.add(ready_player);

    var buttonBar = new C.ButtonBarMain(main_content, main_bg, MallAsset, main_info);
    stage.add(buttonBar);
  }, {sort: true}));
  T.scene('battle', new T.Scene(function (stage) {
    stage.merge('interactive');
    //var background = new T.Sprite({asset: "tina_bg_down.jpg", w: 1280, h: 720, z: -1});
    var background = new C.Background({
      w: 3840,
      data: FoeDate["1_3"]
    });
    stage.add(background);
    var player = new C.Player({
      x: 40,
      y: 500,
      z: 99,
      speed: 50,
      rate: 1 / 5,
      w: 80,
      h: 80,
      center: {x: 40, y: 40},
      background: background
    });
    stage.add(player);

    var y = Math.floor(Math.random() * 400) + 320;
    var foe1 = new C.Foe1({
      x: Math.floor(Math.random() * 100) + 1280,
      y: y,
      z: y,
      player: player,
      background: background,
      speed: Math.floor(Math.random() * 10) + 20,
      rate: this.speed,
      sheet: 'foe2',
      sprite: 'wsj_foe2'
    });
    //foe1.setAnimSheet('foe1','wsj_foe1');
    stage.add(foe1);
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
      "tina_button_yes.jpg", "dj1.png", "dj2.png", "tina_mall_item_bg.png", "equipdetail.png", "chushou_zi.png", "zhuangbei_zi.png",
      "tina_left_no.png", "tina_left_yes.png", "tina_right_no.png", "tina_right_yes.png",
      "tina_player.png", "chacha.png", "equiphouse.png", "prop_trans.png", "shangye.png", "xiaye.png",
      "tina_changeView.png", "tina_player_test.png", "9.png", "wsj_foe1.png", "wsj_foe2.png","tina_money.png",
      "player.json", "enemy.json", "item.json", "mall.json", "wsj_player.json",
      "changeView.json", "wsj_foe1.json", "wsj_foe2.json", "battle.json"],
    function () {
      MallAsset = T.getAsset("mall.json");
      FoeDate = T.getAsset("battle.json");
      //T.compileSheets("tina_player.png", "wsj_player.json");
      T.compileSheets("9.png", "wsj_player.json");
      T.compileSheets("tina_changeView.png", "changeView.json");
      T.compileSheets("wsj_foe1.png", "wsj_foe1.json");
      T.compileSheets("wsj_foe2.png", "wsj_foe2.json");
      _.each([
        ["player", {
          player_idle: {frames: [0], rate: 1},
          player_run: {frames: _.range(0, 7), rate: 1 / 5},
          player_fire: {frames: _.range(8, 15), rate: 1 / 30},
          player_up: {frames: _.range(16, 23), rate: 1 / 10},
          player_die: {frames: _.range(24, 34), rate: 1 / 5},
          player_cartridge: {frames: _.range(35, 48), rate: 1 / 5}
        }],
        ["changeView", {
          change: {frames: _.range(0, 10), rate: 1 / 3}
        }],
        ["wsj_foe1", {
          foe_run: {frames: _.range(0, 8), rate: 1 / 5},
          foe_attack: {frames: _.range(9, 14), rate: 1 / 8, next: "foe_idle"},
          foe_idle: {frames: [8], rate: 1}
        }],
        ["wsj_foe2", {
          foe_run: {frames: _.range(0, 19), rate: 1 / 5},
          foe_attack: {frames: _.range(20, 29), rate: 1 / 8, next: "foe_idle"},
          foe_idle: {frames: [0], rate: 1}
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
      json = localStorage.getItem('json');
      //首次启动, 初始化本地存储
      // if (json == null) {
      json = {
        "player": {
          "level": 1,
          "hp": 100,
          "mp": 100,
          "atk": 10,
          "def": 10,
          "speed": 10,
          "weapen": "无",
          "cloth": "无",
          "trousers": "无",
          "shoes": "无"
        }, "knapsack": {"prop": [1, 2, 1, 2], "money": 0}
      };
      localStorage.setItem('json', JSON.stringify(json));
      // } else {
      // json = JSON.parse(json);
      // }
      ITEM = T.getAsset("item.json");
      ENEMY = T.getAsset("enemy.json");
    }
  );
};