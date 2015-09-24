var F = {};
//求两物体之间的直线距离
F.calcDistance = function (p0, p1) {
  return parseInt(Math.sqrt(Math.pow(p0.x - p1.x, 2) + Math.pow(p0.y - p1.y, 2)));
};
//判断p0在p1的什么方向，顺时针8方向分别用1-8表示，1为正上方，2为右上方——0表示两物体重合
F.judgeDirection = function (p0, p1) {
  var result = null;
  p0_x = parseInt(p0.x);
  p0_y = parseInt(p0.y);
  p1_x = parseInt(p1.x);
  p1_y = parseInt(p1.y);
  p0_w = parseInt((p0.rw || p0.w) / 2);
  p0_h = parseInt((p0.rh || p0.h) / 2);
  p1_w = parseInt((p1.rw || p1.w) / 2);
  p1_h = parseInt((p1.rh || p1.h) / 2);
  if (p0_x + p0_w <= p1_x - p1_w) {//在左边
    if (p0_y + p0_h <= p1_y - p1_h) {
      result = 8;//左上
    } else if (p0_y - p0_h >= p1_y + p1_h) {
      result = 6;//左下
    } else {
      result = 7;//正左
    }
  } else if (p0_x - p0_w >= p1_x + p1_w) {//在右边
    if (p0_y + p0_h <= p1_y - p1_h) {
      result = 2;//右上
    } else if (p0_y - p0_h >= p1_y + p1_h) {
      result = 4;//右下
    } else {
      result = 3;//正右
    }
  } else {//同一竖线
    if (p0_y + p0_h <= p1_y - p1_h) {
      result = 1;//正上
    } else if (p0_y - p0_h >= p1_y + p1_h) {
      result = 5;//正下
    } else {
      result = 0;//重合
    }
  }
  return result;
};
//升级判定,传入角色当前经验值,返回对应的等级，经验值在升级后不置零
F.levelUp = function (exe) {
  var level = 1;
  if (exe > 20) {
    level = 2;
  }
  return level;
};
//整理背包,增加道具、卖出道具
F.tidyKnapsack = function (operation, site) {
  if (operation == 'delete') {
    //删除道具，售出时调用，site传道具在背包中的位置
    json.knapsack.prop.splice(site, 1);
  } else if (operation == 'add') {
    //增加道具，site传增加道具的id
    json.knapsack.prop[json.knapsack.prop.length] = site;
  } else if (operation == "equip") {
    //穿戴装备，site为装备在背包中的位置
    var id = json.knapsack.prop[site];
    switch (ITEM[id].part) {
      case 1:
        if (json.player.weapen != 0) {
          json.knapsack.prop[json.knapsack.prop.length] = json.player.weapen;
        }
        json.player.weapen = id;
        break;
      case 2:
        if (json.player.cloth != 0) {
          json.knapsack.prop[json.knapsack.prop.length] = json.player.cloth;
        }
        json.player.cloth = id;
        break;
      case 3:
        if (json.player.trousers != 0) {
          json.knapsack.prop[json.knapsack.prop.length] = json.player.trousers;
        }
        json.player.trousers = id;
        break;
      case 4:
        if (json.player.shoes != 0) {
          json.knapsack.prop[json.knapsack.prop.length] = json.player.shoes;
        }
        json.player.shoes = id;
        break;
    }
    json.knapsack.prop.splice(site, 1);
  }
  //自动整理背包，按背包中存储道具的id序号从小到大排列
  json.knapsack.prop.sort(function (a, b) {
    return a - b
  });
  localStorage.setItem('json', JSON.stringify(json));
};
//自动寻找主角向其靠近
F.autoSearchEnemy = function (player, enemy) {
  var direct = F.judgeDirection(player, enemy);
  var horizon = F.sameHorizon(player, enemy);
  if (direct || horizon) {
    if (direct > 1 && direct < 5) {
      enemy.x++;
      enemy.scale.x = 1;
    } else if (direct > 5) {
      enemy.x--;
      enemy.scale.x = -1;
    }
    if (enemy.long_rang_attack) {
      if (F.sameHorizon(player, enemy) == -1) {
        enemy.y--;
      } else if (F.sameHorizon(player, enemy) == 1) {
        enemy.y++;
      }
    } else {
      if (direct == 1 || direct == 2 || direct == 8) {
        enemy.y--;
      } else if (direct > 3 && direct < 7) {
        enemy.y++;
      }
    }
    enemy.run();
  } else if (direct == 0 || horizon == 0) {
    enemy.idle();
  }
};
//判断飞行道具是否和主角处于同一水平线,p0:主角，p1:发射飞行道具的敌人,返回值说明：-1表示主角在飞行道具上方，0表示可以打到主角，1表示主角在飞行道具下方
F.sameHorizon = function (p0, p1) {
  var p0_y = parseInt(p0.y);
  var p0_h = parseInt((p0.rh || p0.h) / 2);
  var p1_y = parseInt(p1.y);
  if (p1_y <= p0_y - p0_h) {
    return 1;
  } else if (p1_y <= p0_y + p0_h) {
    return 0;
  } else {
    return -1;
  }
};
/**
 * 从舞台中寻找玩家这个item赋值给foe上
 * @param parent 舞台
 * @returns {*} 返回玩家
 */
F.findPlayer = function (parent, player) {
  var result = null;
  for (var i = 0; i < parent.items.length; i++) {
    if (parent.items[i] instanceof player) {
      result = parent.items[i];
      break;
    }
  }
  return result;
};
/**
 * 使用json中的添加foe，根据x和i,从json中判断是否需要添加。
 * @param data  json数据
 * @param x     地图的左x
 * @param i     下一个foe的id
 * @returns {*} 返回要添加的foe类型
 */
F.addFoe = function (data, x, i) {
  if (data) {
    if (data[i]) {
      if (x > data[i].x) {
        return data[i].foe;
      }
    }
  }
};
/**
 * !!--请注意value的格式--！！
 * localStorage的set操作，如果value为空，则删除该localStage
 * @param id  键
 * @param value 值，为空则删除
 */
F.set_ls = function (id, value) {
  if (!value) {
    if (window.localStorage) {
      localStorage.removeItem(id);
    } else {
      Cookie.write(id, JSON.stringify(value));
    }
  } else {
    if (window.localStorage) {
      try {
        localStorage.setItem(id, JSON.stringify(value));
      } catch (e) {
        console.log("setItem error");
        if (e.name == 'QuotaExceededError') {
          console.log("超出本地存储限制");
        }
      }
    } else {
      Cookie.write(id, JSON.stringify(value));
    }
  }
};
/**
 * localStorage的get操作，如果name为空，则值进行一维查询
 * @param id    键
 * @param name  二维数组的键
 * @returns {*} 查询的值,默认返回空
 */
F.get_ls = function (id, secid) {

  var result = null;
  if (!secid) {
    if (window.localStorage) {
      try {
        if (localStorage.getItem(id)) {
          result = JSON.parse(localStorage.getItem(id));
        }
      } catch (e) {
        console.log("getItem error");
      }
    } else {
      result = JSON.parse(Cookie.read(id));
    }
  }
  else {
    if (window.localStorage) {
      try {
        if (JSON.parse(localStorage.getItem(id))[secid]) {
          result = JSON.parse(localStorage.getItem(id))[secid];
        }
      } catch (e) {
        console.log("getItem error");
      }
    } else {
      result = JSON.parse(Cookie.read(id))[secid];
    }
  }
  return result;
};
/**
 * 删除localStorage中所有的记录
 */
F.removeAll_ls = function () {
  if (window.localStorage) {
    try {
      localStorage.clear();
    } catch (e) {
      console.log("Delete Failed");
    }
  } else {
    //Cookie.clear();
  }
};
/**
 * 位置判定函数
 * @param s 主体
 * @param o 客体
 * @returns {number} 返回正数1-8表示已发生碰撞，分别表示从上、右上、右...发生碰撞
 *                   返回负数(-1)-(-8)表示没有发生碰撞，客体应该向上、右上、右...移动才能遇到主体
 *                   返回0表示 错误
 */
F.position_judge = function (s, o) {
  var result = 0;
  //优先获取rw和rh，除去图画空白后真实的宽高
  var sx = (s.x - s.rw / 2) || (s.x - s.w / 2);
  var sxx = (s.x + s.rw / 2) || (s.x + s.w / 2);
  var sy = (s.y - s.rh / 2) || (s.y - s.h / 2);
  var syy = (s.y + s.rh / 2) || (s.y + s.h / 2);
  var ox = (o.x - o.rw / 2) || (o.x - o.w / 2);
  var oxx = (o.x + s.rw / 2) || (o.x + o.w / 2);
  var oy = (o.y - o.rh / 2) || (o.y - o.h / 2);
  var oyy = (o.y + o.rh / 2) || (o.y + o.h / 2);
  //相对速度默认为0
  var xs = ((o.xs || 0) - (s.xs || 0)) || 0;
  var ys = ((o.ys || 0) - (s.ys || 0)) || 0;
  var xp = 0;
  var yp = 0;
  //判断x方向是否产生碰撞
  if (sx > ox && sx < oxx || sxx > ox && sxx < oxx || sx <= ox && sxx >= oxx) {
    xp = 1;
  }
  //判断y方向是否产生碰撞
  if (sy > oy && sy < oyy || syy > oy && syy < oyy || sy <= oy && syy >= oyy) {
    yp = 1;
  }
  // 如果x和y都不满足碰撞，则方向应该是左上左下右上右下四个方向
  if (xp == 0 && yp == 0) {
    if (sx >= oxx) {
      if (sy >= oyy) {
        result = -4;
      } else if (syy <= oy) {
        result = -2;
      }
    } else if (sxx <= ox) {
      if (sy >= oyy) {
        result = -6;
      } else if (syy <= oy) {
        result = -8;
      }
    }
    //如果y方向满足碰撞，x方向不满足，则方向应该是左或者右
  } else if (xp == 0 && yp == 1) {
    if (sx >= oxx) {
      result = -3;
    } else if (sxx <= ox) {
      result = -7;
    }
    //如果x方向满足碰撞，y方向不满足，则方向应该是上或者下
  } else if (xp == 1 && yp == 0) {
    if (sy >= oyy) {
      result = -5;
    } else if (syy <= oy) {
      result = -1;
    }
    //如果x和y方向都满足碰撞，判定碰撞方向
  } else if (xp == 1 && yp == 1) {
    if (xs == 0) {
      //只能从上下碰撞,r_x_speed==0
      if (ys > 0) {
        result = 1;
      } else if (ys < 0) {
        result = 2;
      } else {
        result = 5;
      }
    } else if (ys == 0) {
      //只能从左右进行碰撞,r_y_speed==0
      if (xs > 0) {
        result = 3;
      } else if (xs < 0) {
        result = 4;
      } else {
        result = 5;
      }
    } else if (xs > 0 && ys > 0) {
      //这时候只能从目标的左或者上方进行碰撞"↘"
      //交叉相乘，避免分母0
      if ((syy - oy) * xs < (sxx - ox) * ys) {
        result = 1;
      } else {
        result = 3;
      }

    } else if (xs < 0 && ys < 0) {
      //这时候只能从目标的右或者下方进行碰撞"↖"
      if ((oyy - sy) * xs < (oxx - sx) * ys) {
        result = 4;
      } else {
        result = 2;
      }
    }
    else if (xs > 0 && ys < 0) {
      //这时候只能从目标的左或者下方进行碰撞"↗"
      if ((sy - oyy) * xs < (sxx - ox) * ys) {
        result = 3;
      } else {
        result = 2;
      }
    }
    else if (xs < 0 && ys > 0) {
      //这时候只能从目标的右或者上方进行碰撞"↙"
      if ((syy - oy) * xs < (sx - oxx) * ys) {
        result = 4;
      } else {
        result = 1;
      }
    }
  }
  //仅做测试使用
  if (result == 0) {
    console.log("position error");
  }
  return result;
};
/**
 * 碰撞函数调用
 * p表示判断主体，f表示被判断主体（一般p用于玩家，f用于怪物）
 * @param i   0判定是否碰撞方向，1判定寻找方向
 * @param p_x    左
 * @param p_y   上
 * @param p_xx    右
 * @param p_yy    下
 * @param f_x   左
 * @param f_y   上
 * @param f_xx    右
 * @param f_yy    下
 * @param p_x_speed
 * @param p_y_speed
 * @param f_x_speed
 * @param f_y_speed
 * @returns {number}  若i=0，0为未碰撞（判定碰撞失败），返回1-8，分别表示上，右上，右，依次。。
 *                    若i=1，0为已碰撞（判定寻找失败），返回(-1)-(-8)，分别表示寻找方向为上，右上，右，依次。。
 */
F.impact = function (i, p_x, p_y, p_xx, p_yy, f_x, f_y, f_xx, f_yy, p_x_speed, p_y_speed, f_x_speed, f_y_speed) {
  var result = 0;
  if (i) {
    var x = 0;
    var y = 0;
    if ((p_x - f_xx) > -1 || (f_x - p_xx) > -1) {
      if (p_x > f_xx) {
        x = 1;
      } else if (p_xx < f_x) {
        x = -1;
      }
    }
    if ((p_y - f_yy) > -1 || (f_y - p_yy) > -1) {
      if (p_y > f_yy) {
        y = 1;
      } else if (p_yy < f_y) {
        y = -1;
      }
    }
    //方向返回按上下左右八方为返回，如果重合(碰撞)返回0
    if (x == -1) {
      if (y == -1) {
        result = -8;
      } else if (y == 1) {
        result = -6;
      } else {
        result = -7;
      }
    } else if (x == 0) {
      if (y == -1) {
        result = -1;
      } else if (y == 1) {
        result = -5;
      }
    } else if (x == 1) {
      if (y == -1) {
        result = -2;
      } else if (y == 1) {
        result = -4;
      } else {
        result = -3;
      }
    }
  } else {
    //不能判定碰撞后相对位置，所以只能判定碰撞后，进行位置判断
    //p_x在f_x和f_xx之间时，不能判定从右边碰撞
    if (p_y > f_y && p_y < f_yy || p_yy > f_y && p_yy < f_yy || p_y < f_y && p_yy > f_yy) {
      if (p_x > f_x && p_x < f_xx || p_xx > f_x && p_xx < f_xx || p_x < f_x && p_xx > f_xx) {

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
  }
  return result;
};
/**
 * 位置判定函数
 * @param s 主体
 * @param o 客体
 * @param sw  自定义主体左宽
 * @param sh  自定义主体上高
 * @param ow  自定义客体左宽
 * @param oh  自定义客体上高
 * @param sww  自定义主体右宽
 * @param shh  自定义主体下高
 * @param oww  自定义客体右宽
 * @param ohh  自定义客体下高
 * @returns {number} 返回正数1-8表示已发生碰撞，分别表示从上、右上、右...发生碰撞
 *                   返回负数(-1)-(-8)表示没有发生碰撞，客体应该向上、右上、右...移动才能遇到主体
 *                   返回0表示 错误
 */
F.position_judge = function (s, o, sw, sh, ow, oh, sww, shh, oww, ohh) {
  var result = 0;
  //优先获取rw和rh，除去图画空白后真实的宽高
  var sx = (s.x - sw / 2) || (s.x - s.rw / 2) || (s.x - s.w / 2);
  var sxx = (s.x + (sww || sw) / 2) || (s.x + s.rw / 2) || (s.x + s.w / 2);
  var sy = (s.y - sh / 2) || (s.y - s.rh / 2) || (s.y - s.h / 2);
  var syy = (s.y + (shh || sh) / 2) || (s.y + s.rh / 2) || (s.y + s.h / 2);
  var ox = (o.x - ow / 2) || (o.x - o.rw / 2) || (o.x - o.w / 2);
  var oxx = (o.x + (oww || ow) / 2) || (o.x + o.rw / 2) || (o.x + o.w / 2);
  var oy = (o.y - oh / 2) || (o.y - o.rh / 2) || (o.y - o.h / 2);
  var oyy = (o.y + (ohh || oh) / 2) || (o.y + o.rh / 2) || (o.y + o.h / 2);
  //相对速度默认为0
  var xs = ((o.xs || 0) - (s.xs || 0)) || 0;
  var ys = ((o.ys || 0) - (s.ys || 0)) || 0;
  var xp = 0;
  var yp = 0;
  //判断x方向是否产生碰撞
  if (sx > ox && sx < oxx || sxx > ox && sxx < oxx || sx <= ox && sxx >= oxx) {
    xp = 1;
  }
  //判断y方向是否产生碰撞
  if (sy > oy && sy < oyy || syy > oy && syy < oyy || sy <= oy && syy >= oyy) {
    yp = 1;
  }
  // 如果x和y都不满足碰撞，则方向应该是左上左下右上右下四个方向
  if (xp == 0 && yp == 0) {
    if (sx >= oxx) {
      if (sy >= oyy) {
        result = -4;
      } else if (syy <= oy) {
        result = -2;
      }
    } else if (sxx <= ox) {
      if (sy >= oyy) {
        result = -6;
      } else if (syy <= oy) {
        result = -8;
      }
    }
    //如果y方向满足碰撞，x方向不满足，则方向应该是左或者右
  } else if (xp == 0 && yp == 1) {
    if (sx >= oxx) {
      result = -3;
    } else if (sxx <= ox) {
      result = -7;
    }
    //如果x方向满足碰撞，y方向不满足，则方向应该是上或者下
  } else if (xp == 1 && yp == 0) {
    if (sy >= oyy) {
      result = -5;
    } else if (syy <= oy) {
      result = -1;
    }
    //如果x和y方向都满足碰撞，判定碰撞方向
  } else if (xp == 1 && yp == 1) {
    if (xs == 0) {
      //只能从上下碰撞,r_x_speed==0
      if (ys > 0) {
        result = 1;
      } else if (ys < 0) {
        result = 2;
      } else {
        result = 5;
      }
    } else if (ys == 0) {
      //只能从左右进行碰撞,r_y_speed==0
      if (xs > 0) {
        result = 3;
      } else if (xs < 0) {
        result = 4;
      } else {
        result = 5;
      }
    } else if (xs > 0 && ys > 0) {
      //这时候只能从目标的左或者上方进行碰撞"↘"
      //交叉相乘，避免分母0
      if ((syy - oy) * xs < (sxx - ox) * ys) {
        result = 1;
      } else {
        result = 3;
      }

    } else if (xs < 0 && ys < 0) {
      //这时候只能从目标的右或者下方进行碰撞"↖"
      if ((oyy - sy) * xs < (oxx - sx) * ys) {
        result = 4;
      } else {
        result = 2;
      }
    }
    else if (xs > 0 && ys < 0) {
      //这时候只能从目标的左或者下方进行碰撞"↗"
      if ((sy - oyy) * xs < (sxx - ox) * ys) {
        result = 3;
      } else {
        result = 2;
      }
    }
    else if (xs < 0 && ys > 0) {
      //这时候只能从目标的右或者上方进行碰撞"↙"
      if ((syy - oy) * xs < (sx - oxx) * ys) {
        result = 4;
      } else {
        result = 1;
      }
    }
  }
  //仅做测试使用
  if (result == 0) {
    console.log("position error");
  }
  return result;
};
F.autoSearchPlayer = function (s, o, sw, sh, ow, oh, sww, shh, oww, ohh) {
  var result = F.position_judge(s, o, sw, sh, ow, oh, sww, shh, oww, ohh);
  if (result < 0) {
    o.run();
    if (result == -1) {
      o.y--;
    } else if (result == -2) {
      o.y--;
      o.x++;
      o.scale.x = 1;
    } else if (result == -3) {
      o.x++;
      o.scale.x = 1;
    } else if (result == -4) {
      o.y++;
      o.x++;
      o.scale.x = 1;
    } else if (result == -5) {
      o.y++;
    } else if (result == -6) {
      o.x--;
      o.y++;
      o.scale.x = -1;
    } else if (result == -7) {
      o.x--;
      o.scale.x = -1;
    } else if (result == -8) {
      o.y--;
      o.x--;
      o.scale.x = -1;
    }
  } else {
    o.idle();
  }
};
/**
 * 寻找玩家
 * @param s 主体（玩家）
 * @param o 客体
 * @param sw  自定义主体左宽
 * @param sh  自定义主体上高
 * @param ow  自定义客体左宽
 * @param oh  自定义客体上高
 * @param sww  自定义主体右宽
 * @param shh  自定义主体下高
 * @param oww  自定义客体右宽
 * @param ohh  自定义客体下高
 */
F.searchPlayer = function (s, o, sw, sh, ow, oh, sww, shh, oww, ohh) {
  var result = F.position_judge(s, o, sw, sh, ow, oh, sww, shh, oww, ohh);
  if (result == -1) {
    o.xs = 0;
    o.ys = -o._ys;
  } else if (result == -2) {
    o.ys = -o._ys;
    o.xs = o._xs;
  } else if (result == -3) {
    o.xs = o._xs;
    o.ys = 0;
  } else if (result == -4) {
    o.ys = o._ys;
    o.xs = o._xs;
  } else if (result == -5) {
    o.xs = 0;
    o.ys = o._ys;
  } else if (result == -6) {
    o.xs = -o._xs;
    o.ys = o._ys;
  } else if (result == -7) {
    o.xs = -o._xs;
    o.ys = 0;
  } else if (result == -8) {
    o.ys = -o._ys;
    o.xs = -o._xs;
  }
};