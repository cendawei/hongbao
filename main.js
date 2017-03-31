/*****
 * Cocos2d-JS Lite Version: 精简版本只包含Cocos2d-JS的核心特性，它的优势是稳定，轻量，简单易用。它所包含的特性列表如下：
 Canvas渲染器 (不支持WebGL)
 场景和图层
 事件管理器
 计时器
 精灵和贴图          // 由于精简版没有按钮，需要用精灵（sprite)来创建，交互效果可以通过触摸事件来改变图片
 TTF文本
 声音
 动作
 菜单和菜单项
 * @type {void|*}
 */
var StartLayer = cc.Layer.extend({
    ctor:function () {
        this._super();
        var size = cc.winSize;
// 背景
        var gamebg = new cc.LayerColor(cc.color(222,15,33,255));
        this.addChild(gamebg, 0);
// 声音开关
        var path, sName;
        if (config.soundState){
            path = res.sound_on;
            sName = 'soundOn';
        }else{
            path = res.sound_off;
            sName = 'soundOff';
        }
        var sound = new HbSprite(path);
        sound.attr({
            x: size.width - 50,
            y: size.height - 50
        });
        sound.setUserData({name:sName});
        this.addChild(sound, 10);
// 规则
        var relut = new cc.Sprite(res.st);
        relut.attr({
            x: size.width/2,
            y: size.height - 260
        });
        this.addChild(relut, 5);
// 开始Btn
        var startItem = new cc.MenuItemImage(
            res.stBtn,
            res.stBtn,
            function () {
                cc.director.runScene(new timeScene());
            }, this);
        startItem.attr({
            x: size.width / 2,
            y: 200,
            anchorX: 0.5,
            anchorY: 0.5
        });

        var menu = new cc.Menu(startItem);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu, 5);
    }
});
var StartScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new StartLayer();
        this.addChild(layer);

        // 音乐播放 (html5)
        gameSound.playSound(1);

        //if (config.soundState){  // cocos 模式
        //   cc.audioEngine.playMusic(res.sound_bg, false);
        //}
    }
});


var timeLayer = cc.Layer.extend({
    time:null,
    ctor:function () {
        this._super();
        var size = cc.winSize;
// 背景
        var gamebg = new cc.LayerColor(cc.color(222,15,33,255));
        this.addChild(gamebg, 0);
// 背景 礼花
        var bgEff = new cc.Sprite(res.tBg);
        bgEff.attr({
            x: size.width / 2,
            y: size.height * 0.7
        });
        this.addChild(bgEff, 1);

// 数字
        var label2 = new cc.Sprite(res.num3);
        label2.attr({
            x: size.width / 2,
            y: size.height / 2 + 50
        });
        this.addChild(label2, 10, 100);

        var fade = cc.fadeOut(1.0);
        var fade_in = fade.reverse();
        var delay = cc.delayTime(0.25);
        var seq = cc.sequence(fade, delay, fade_in, delay.clone(),fade.clone());
        label2.runAction(seq);

        this.time = 3;

        this.schedule(this.step,1, 1, 1);
    },
    step:function (dt) {
        this.time -= parseInt(dt).toFixed(10);

        var label2 = this.getChildByTag(100);
        var num = this.time==2 ? res.num2 : res.num1;
        label2.setTexture(num);

        if (this.time==1){
            this.scheduleOnce(this.play, 1);
        }
    },
    play: function(){
        cc.director.runScene(new PlayScene());
    }
});
var timeScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new timeLayer();
        this.addChild(layer);
    }
});

var sendCmd = {
    sendAjaxData: function(act){
        var sUrl = '/handlers/mobilehandler.ashx';
        var hbGuid = this.getStorage();
        if (!hbGuid){
            this.setStorage();
        }
        var param = {
            'devicef': hbGuid,
            'type'   : 'hongbao2016',
            'act'    : act,                //1-打开页面，2-游戏结果，3-分享
            'score'  : resultData.hbNum
        };
        //$.ajax({
        //    type:'post',
        //    url: sUrl,
        //    data: param,
        //    success: function(msg){
        //        var m = msg;
        //    },
        //    error: function(er){
        //
        //    }
        //});
    },
    newGuid: function(){
        var guid = "";
        for (var i = 1; i <= 32; i++){
            var n = Math.floor(Math.random()*16.0).toString(16);
            guid +=   n;
            //if((i==8)||(i==12)||(i==16)||(i==20))
            //    guid += "-";
        }
        return guid;
    },
    setStorage: function(){
        var hbGuid = this.newGuid();
        localStorage.setItem("hbGuid", hbGuid);
    },
    getStorage: function(){
        var hbGuid = localStorage.getItem("hbGuid");
        return hbGuid;
    }
};

/***音频处理
 * 由于音频放到了外部的服务器中，只能改用html5原生来处理音频
 *
 * ***/
var sBg = document.getElementById("game_sound"),
    sHb = document.getElementById("sound_eff1"),
    sOver = document.getElementById("sound_eff2");

var gameSound = {
    playSound: function(type) {         // 播放
        if (!config.soundState) return;

        if (type==1) {
            sBg.play();
        }else if(type==2){
            sHb.play();
        }else if(type==3){
            sOver.play();
        }
    },
    pauseSound: function(type){             // 暂停
        config.soundState = false;
        if (type==1) {
            sBg.pause();
        }else if(type==2){
            sHb.pause();
        }else if(type==3){
            sOver.pause();
        }
    },
    resumeSound: function(type){            // 恢复播放
        config.soundState = true;
        this.playSound(type);
    }
};