/*** 配置表  ***/
var config = {
    //常用配置
    dPage    : 70,           // 红包总页数（3X3为1页)
    speed    : 0.8,          // 红包每行创建初始速度（s), *4为下落结束时间
    maxSpeed : 0.25,         // 最大速度
    lessNum  : 1,            // >=漏点红包数（结束)
    wishNum  : [40, 80, 120, 150],    // 红包寄语
    pLink    : 'http://www.025.com/',

    soundState : 0,       // 音乐开关（默认开)
    initPlay   : 0,       // 是否一进入就播放（必须与soundState值保持一致)

    //
    dType    : 0,            // 1:以时间（按倒计时为结束） 0：以数量（按页面显示完为结束)
    timeout  : 20,           // 倒计时（s)
    numArr   : [15, 70, 80, 100]   // 红包页数范围，（数组下标对应createGroup函数注释的数量）eg:[10,20,0,0] 前15页2红1炸弹，15-70页2红1炸弹
};
/*** 配置表 End ***/

/************ 核心数据 *****************/
var createGroup = {
    '0': function(){                        // 1红2炸弹
        var r = makeData.mRandInt(2),
            group = [0, 0, 0];
        group[r] = 1;
        return group;
    },
    '1': function(){                        // 2红1炸弹
        var r = makeData.mRandInt(2),
            group = [1, 1, 1];
        group[r] = 0;
        return group;
    },
    '2': function(){                        // 全红包
        var group = [1, 1, 1];
        return group;
    },
    '3': function(){                        // 全炸弹
        var group = [0, 0, 0];
        return group;
    }
};
// 9宫格数组
var createNine = {
    'a': function(){
        return [createGroup['1'](), createGroup['1'](), createGroup['1']()];
    },
    'b': function(){
        return [createGroup['0'](),  createGroup['0'](), createGroup['0']()];
    },

/*** old ***/
    //'a': function(){
    //    return [createGroup['0'](), createGroup['0'](), createGroup['0']()];
    //},
    //'b': function(){
    //    return [createGroup['1'](), createGroup[makeData.mRandInt(2)](), createGroup[makeData.mRandInt(2)]()];
    //},
    'c': function(){
        return [createGroup['2'](), createGroup[makeData.mRandInt(2)](), createGroup[makeData.mRandInt(2)]()];
    },
    'd': function(){
        return [createGroup['2'](), createGroup['2'](), createGroup[makeData.mRandInt(2)]()];
    }
};
var makeData = {
    group : [],

    mRandInt: function(num){
        return Math.round(Math.random()*num);
    },
    concatArr: function(arr){
        var i, len=arr.length;
        for(i=0; i<len; i++){
            this.group.push(arr[i]);
        }
    },
    createLow: function(num){
        var i, b;
        this.group = [];
        for(i=0; i<num; i++){
            b=createNine.a();
            this.concatArr(b);
        }
        return this.group;
    },
    createNormal: function(num){
        var i, b;
        this.group = [];
        for(i=0; i<num; i++){
            b=createNine.b();
            this.concatArr(b);
        }
        return this.group;
    },
    createNormalAdd: function(num){
        var i, b;
        this.group = [];
        for(i=0; i<num; i++){
            b=createNine.c();
            this.concatArr(b);
        }
        return this.group;
    },
    createHeight: function(num){
        var i, b;
        this.group = [];
        for(i=0; i<num; i++){
            b=createNine.d();
            this.concatArr(b);
        }
        return this.group;
    },
    createData: function(){
        var group, num = config.dPage;
        var no = config.numArr[0], no1 = config.numArr[1];

        if (num <= no){
            group = this.createLow(num);
        }
        if (num >no && num <=no1){
            var group1 = this.createLow(no);
            var group2 = this.createNormal(num-no);
            group = group1.concat(group2);
        }

        if (num >config.numArr[1] && num <=config.numArr[2]){
            group = this.createNormalAdd(num);
        }
        if (num >config.numArr[2] && num <=config.numArr[3]){
            group = this.createHeight(num);
        }
        return group;
    }
};
/************ 核心数据 END *****************/

/************ cocos 逻辑区 *****************/
var resultData = {
    hbNum : '0',
    speedNum : '0',
    callMe : '红包菜鸟'
};
var PlayLayer = cc.Layer.extend({
    bgSprite        : null,         // 背景
    hongbaoSprites  : null,         // 红包
    scoreLabel      : null,
    speedLabel      : null,
    score           : 0,            // 积分
    timeout         : config.timeout,
    speed           : config.speed,
    refresh         : true,         // 倒计时结束，限制创建

    hbData          : null,         // 红包数据
    lessClick       : config.lessNum,            // 漏点红包数

    ctor:function () {
        this._super();
        this.hongbaoSprites = [];
        var size = cc.winSize;

        this.hbData = makeData.createData();
        //this.schedule(this.update, this.speed, 16*1024, this.speed);    //arg: 回调、间隔、重复次数、第一次调度开始执行前的等待总时间

        // 背景1(red)
        var gamebg = new cc.LayerColor(cc.color(222,15,33,255));      // bg底色
        this.addChild(gamebg, 0);

         //头部遮盖红包 (red)
        var gamebg2 = new cc.LayerColor(cc.color(222,15,33,255), size.width, 320);
        gamebg2.attr({
            x: 0,
            y: size.height -210
        });
        this.addChild(gamebg2, 8);

        // 黄色底纹
        var yellow = new cc.Sprite(res.bg_img);
        yellow.attr({
            x: size.width / 2,
            y: size.height /2 -100
        });
        var w = size.width-40, h = size.height-100;
        //yellow.setScaleX(w/96);
        yellow.setScaleY(h/710);
        this.addChild(yellow, 1);
        // 头部横幅
        this.bgSprite = new cc.Sprite(res.bg_top);
        this.bgSprite.attr({
            x: size.width / 2,
            y: size.height - 100
        });
        this.addChild(this.bgSprite, 10);
        // foot 底部色(red)
        this.bgBottom = new cc.LayerColor(cc.color(222,15,33,255), size.width, 20);
        this.addChild(this.bgBottom, 10);
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
        this.addChild(sound, 15);
        // 积分
        this.scoreLabel = new cc.LabelTTF("X 0", "Arial", 32);
        this.scoreLabel.attr({
            x:size.width /2,
            y:size.height - 180
        });
        this.scoreLabel.setColor(cc.color(251,225,151,255));
        this.addChild(this.scoreLabel, 15);
        // 手速
        //this.speedLabel = new cc.LabelTTF("speed:0", "Arial", 32);
        //this.speedLabel.attr({
        //    x:size.width -80,
        //    y:size.height - 90
        //});
        //this.speedLabel.setColor(cc.color(0,166,90,255));
        //this.addChild(this.speedLabel, 15);

        /*** 创建红包精灵 st ***/
        this.scheduleOnce(this.createAdd, this.speed);
        this.addHongbao();
        /*** 创建红包精灵 end ***/

        // timer倒计时60
        if (config.dType) {
            this.schedule(this.timer, 1, this.timeout, 1);
        }
        return true;
    },
    // 加速度
    changeSpeed: function(){
        if (this.speed<=config.maxSpeed) return;
        this.speed = parseFloat((this.speed-0.01).toFixed(10));
    },
    createAdd: function(){
        if (!this.refresh) return;

        var self = this;
        setTimeout(function(){self.createAdd();}, this.speed*1000);
        this.update();
    },
    update : function() {
        this.addHongbao();
        this.removeHongbao();

        this.changeSpeed();    // 调节速度
    },
    // 创建红包
    addHongbao : function() {
        var data, leng=0, i= 0, png;
        data = this.hbData.splice(0,1);
        if (data[0]) {
            leng = data[0].length;
        }else{
            this.timer('over');  // 结束
        }
        for(; i<leng; i++) {    // 每次创建3个
            var index = data[0][i];
            png = index==1? res.hb : res.bomb;

            var hongbao = new HbSprite(png);
            var size = cc.winSize;

            var perW = Math.ceil((size.width-80) / 3);
            var x = 100 + (perW * (i % 3));
            hongbao.attr({
                x: x + 33,
                y: size.height -100
            });

            hongbao.setUserData({'id':index, 'speed':this.speed});
            this.addChild(hongbao, 5);
            this.hongbaoSprites.push(hongbao);

            var dorpAction = cc.MoveTo.create(this.speed*4, cc.p(hongbao.x, -80));
            hongbao.runAction(dorpAction);
        }
    },
    removeHongbao : function() {
        //移除到屏幕底部的hongbao
        for (var i = 0; i < this.hongbaoSprites.length; i++) {
            if(30 >= this.hongbaoSprites[i].y) {
                var info = this.hongbaoSprites[i].getUserData();
                if(info.id==1 && !info.ishit){
                    this.lessClickAdd();
                }
                this.hongbaoSprites[i].removeFromParent();
                this.hongbaoSprites[i] = undefined;
                this.hongbaoSprites.splice(i,1);
                i= i-1;
            }
        }
    },
    lessClickAdd: function(){
        this.lessClick ++;
        if (this.lessClick>=1){
            this.timer('over');
            return;
        }
    },
    timer : function(type) {
        if (this.refresh && (this.timeout <= 0 || type=='over')) {
            this.refresh = false;
            //cc.audioEngine.playEffect(res.sound_over);      // cocos2d 结束音效
            gameSound.playSound(3);

            var gameOver = new cc.LayerColor(cc.color(25,25,25,100));
            var size = cc.winSize;
            var titleLabel = new cc.Sprite(res.over);
            titleLabel.attr({
                x:size.width / 2 ,
                y:size.height / 2
            });
            gameOver.addChild(titleLabel, 100);

            this.getParent().addChild(gameOver);

            this.unschedule(this.update);
            this.unschedule(this.timer);

            this.scheduleOnce(this.result, 1);
            return;
        }

        this.timeout -= 1;      // 倒计时
    },
    // 积分/手速
    addScore:function(info){
        if (this.refresh) {
            this.score += 1;
            this.scoreLabel.setString("X " + this.score);
            resultData.hbNum = this.score;

            // 手速
            var sp = parseFloat(info.speed*4/3).toFixed(2);
            //this.speedLabel.setString("speed:"+ sp);
            resultData.speedNum = sp;
        }
    },

    result: function(){
        cc.director.runScene(new resultScene());

        document.title = '抢得'+ resultData.hbNum +'个红包，抢一个红包只用'+ resultData.speedNum +'秒，请叫我'+ resultData.callMe;
    }
});

var PlayScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new PlayLayer();
        this.addChild(layer);
    }

});

// 红包对象
var HbSprite = cc.Sprite.extend({
    touchListener   : null,
    onEnter:function () {
        this._super();

        this.addTouchEventListenser();
    },
    onExit:function () {

    },
    addTouchEventListenser:function() {   // 事件不多，不再做分离
        this.touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                var pos = touch.getLocation();
                var target = event.getCurrentTarget();
                if ( cc.rectContainsPoint(target.getBoundingBox(),pos)) {
                    // 音效开关
                    var info = target.getUserData();
                    if (info.name=='soundOn'){
                        //cc.audioEngine.pauseAllEffects();
                        //cc.audioEngine.pauseMusic();
                        //config.soundState = false;

                        gameSound.pauseSound(1);

                        target.setTexture(res.sound_off);
                        target.setUserData({name:'soundOff'});
                        return true;
                    }else if(info.name=='soundOff'){
                        //if (config.initPlay) {
                        //    cc.audioEngine.resumeAllEffects();    // cocos2d 音效
                        //    cc.audioEngine.resumeMusic();         // cocos2d 背景音
                        //}else{
                        //    target.musicOn();           // 开启音乐
                        //    config.soundState = true;
                        //}
                        //config.soundState = true;     // cocos

                        gameSound.resumeSound(1);

                        target.setTexture(res.sound_on);
                        target.setUserData({name:'soundOn'});
                        return true;
                    }

                    if(!target.getParent().refresh) return false;

                    if (info.name){
                        if (info.name=='againBtn'){     // 再玩一次
                            target.setTexture(res.ag_hover);
                            cc.eventManager.removeAllListeners();       // 清除监听器
                            target.schedule(target.playAgain, 0, 0, 0.2);
                        }else if(info.name == 'shareBtn'){      // 分享
                            target.setTexture(res.sh_hover);
                            //sendCmd.sendAjaxData();
                            target.getParent().shareGame();
                            target.schedule(function(){target.setTexture(res.share)}, 0, 0, 0.2);
                        }else if(info.name=='pLink'){  // 下载链接
                            window.location.href = config.pLink;
                        }
                    }else {
                        if (info.id == 1) {
                            // 点击了红包  your code
                            //cc.audioEngine.playEffect(res.sound_hb);  // cocos2d 开音效
                            gameSound.playSound(2);

                            target.getParent().addScore(info);          // 积分
                            target.moveBychat(target);
                            target.setUserData({'ishit': 1});           // 添加点击标记
                        } else {
                            // 点击了炸弹  your code
                            target.getParent().timer('over');
                            target.moveBychat(target, 'bond');
                        }
                    }
                    target.removeTouchEventListenser();

                    return true;
                }
                return false;
            }
        });
        cc.eventManager.addListener(this.touchListener,this);
    },

    // 移除点击事件
    removeTouchEventListenser:function(){
        cc.eventManager.removeListener(this.touchListener);
    },
    playAgain: function(){
        resultData.hbNum = '0';
        resultData.speedNum = '0';
        resultData.callMe = '红包菜鸟';

        cc.director.runScene(new timeScene());
    },
    // 点击红包消失 效果
    moveBychat: function(hbSprite, type){
        var action;
        if (!type){
            action = cc.sequence(
                cc.scaleTo(0.3, 0.1),
                cc.fadeOut(0.2),
                cc.callFunc(this.removeFromParent, this)
            );
        }else {
            var scale1 = cc.scaleBy(0.1, 0.9);
            var scale2 = cc.scaleBy(0.1, 1.1);
            action = cc.sequence(
                scale1,
                scale1.reverse(),
                scale2,
                scale2.reverse(),
                scale1,
                scale1.reverse(),
                scale2,
                scale2.reverse()
            );
        }
        //var move1 = cc.moveBy(0.1, cc.p(-5, 0));
        //var move2 = cc.moveBy(0.1, cc.p(5, 0));
        //var seq = cc.sequence(move1, move2, move1.reverse());
        //var action = cc.sequence(seq, seq.reverse());

        hbSprite.runAction(action);
    },
    // 启动音乐 cocos2d
    musicOn: function(){
        cc.audioEngine.playMusic(res.sound_bg, true);
        config.soundState = true;
    }
});

var resultLayer = cc.Layer.extend({
    scoreLabel: null,
    speedLabel: null,

    agSprite: null,
    shSprite: null,
    refresh: true,

    maskLayer: null,
    shareLink: null,

    ctor:function () {
        this._super();
        var size = cc.winSize;
        // 背景1(red)
        var gamebg = new cc.LayerColor(cc.color(222,15,33,255));     // 底色
        this.addChild(gamebg, 0);
        // 背景2 (yellow)
        //var gamebg2 = new cc.LayerColor(cc.color(255,240,136,255), size.width-40, size.height-270);      // 底色
        //gamebg2.attr({
        //    x: 20,
        //    y: 20
        //});
        //this.addChild(gamebg2, 1);
        var gamebg2 = new cc.Sprite(res.bg_img);      // 底色
        gamebg2.attr({
            x: size.width / 2,
            y: size.height /2 -100
        });
        //var w = size.width-40, h = size.height-120;
        //gamebg2.setScaleX(w/96);
        //gamebg2.setScaleY(h/96);
        this.addChild(gamebg2, 1);

        // 头部
        var rtSprite = new cc.Sprite(res.result);
        rtSprite.attr({
            x: size.width / 2,
            y: size.height - 90
        });
        this.addChild(rtSprite, 10);
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
        this.addChild(sound, 15);

        // 成绩icon
        var rbIcon = new cc.Sprite(res.hbIcon);
        rbIcon.attr({
            x: 120,
            y: size.height/2 + 205
        });
        this.addChild(rbIcon, 10);

        // 称号icon
        var rewIcon = new cc.Sprite(res.rewIcon);
        rewIcon.attr({
            x:120,
            y:size.height /2 + 15
        });
        this.addChild(rewIcon, 10);

        // line1
        var line1 = new cc.Sprite(res.line1);
        line1.attr({
            x: 320,
            y: size.height/2 + 60
        });
        this.addChild(line1, 10);

        // line2
        var line2 = new cc.Sprite(res.line1);
        line2.attr({
            x: 320,
            y: size.height/2 - 90
        });
        this.addChild(line2, 10);
        // line3
        var line3 = new cc.Sprite(res.line1);
        line3.attr({
            x: 320,
            y: 140
        });
        this.addChild(line3, 10);
        // 积分
        var scoreTxt1 = "红包：";
        this.scoreLabel1 = new cc.LabelTTF(scoreTxt1, "Microsoft Yahei", 30);
        this.scoreLabel1.attr({
            x:50,
            y:size.height /2 + 125
        });
        this.scoreLabel1.setColor(cc.color(0,0,0,255));
        this.scoreLabel1.setAnchorPoint(0, 0);
        this.addChild(this.scoreLabel1, 15);

        var scoreTxt = resultData.hbNum;
        this.scoreLabel = new cc.LabelTTF(scoreTxt, "Microsoft Yahei", 42);
        this.scoreLabel.attr({
            x:180,
            y:size.height /2 + 145
        });
        this.scoreLabel.setColor(cc.color(221,16,33,255));
        //this.scoreLabel.setAnchorPoint(0, 0);
        this.addChild(this.scoreLabel, 15);

        var scoreTxt2 = "个";
        this.scoreLabel2 = new cc.LabelTTF(scoreTxt2, "Microsoft Yahei", 30);
        this.scoreLabel2.attr({
            x:230,
            y:size.height /2 + 120
        });
        this.scoreLabel2.setColor(cc.color(0,0,0,255));
        this.scoreLabel2.setAnchorPoint(0, 0);
        this.addChild(this.scoreLabel2, 15);

        // 手速
        this.speedLabel1 = new cc.LabelTTF("手速：", "Microsoft Yahei", 30);
        this.speedLabel1.attr({
            x:50,
            y:size.height /2 + 75
        });
        this.speedLabel1.setColor(cc.color(0,0,0,255));
        this.speedLabel1.setAnchorPoint(0, 0);
        this.addChild(this.speedLabel1, 15);

        var spTxt = resultData.speedNum;
        this.speedLabel = new cc.LabelTTF(spTxt, "Microsoft Yahei", 42);
        this.speedLabel.attr({
            x:185,
            y:size.height /2 + 90
        });
        this.speedLabel.setColor(cc.color(221,16,33,255));
        //this.speedLabel.setAnchorPoint(0, 0);
        this.addChild(this.speedLabel, 15);

        this.speedLabel1 = new cc.LabelTTF("秒/个", "Microsoft Yahei", 30);
        this.speedLabel1.attr({
            x:240,
            y:size.height /2 + 75
        });
        this.speedLabel1.setColor(cc.color(0,0,0,255));
        this.speedLabel1.setAnchorPoint(0, 0);
        this.addChild(this.speedLabel1, 15);
        // 称号
        var info = this.getTitle();
        var title = info.name;
        var titleLabel = new cc.LabelTTF(title, "Microsoft Yahei", 42);
        titleLabel.attr({
            x: 80,
            y: size.height/2 - 80
        });
        titleLabel.setColor(cc.color(0,0,0,255));
        titleLabel.setAnchorPoint(0, 0);
        this.addChild(titleLabel, 15);

        // 寄语
        var spIcon = new cc.Sprite(res.wishIcon);
        spIcon.attr({
            x: 120,
            y: size.height/2 - 140
        });
        this.addChild(spIcon, 10);

        var wishTxt = info.des1;
        wishLabel = new cc.LabelTTF(wishTxt, "Microsoft Yahei", 30);
        wishLabel.attr({
            x:size.width /2,
            y:size.height /2 -200
        });
        wishLabel.setColor(cc.color(0,0,0,255));
        this.addChild(wishLabel, 15);

        var wishTxt2 = info.des2;
        wishLabel2 = new cc.LabelTTF(wishTxt2, "Microsoft Yahei", 30);
        wishLabel2.attr({
            x:50,
            y:size.height /2 -260
        });
        wishLabel2.setColor(cc.color(0,0,0,255));
        wishLabel2.setAnchorPoint(0, 0);
        this.addChild(wishLabel2, 15);
        // link
        this.shLink = new HbSprite(res.pLink);
        this.shLink.attr({
            x: size.width / 2,
            y: 185
        });
        this.shLink.setUserData({name:'pLink'});
        this.addChild(this.shLink, 16);
        // 再来一次
        this.agSprite = new HbSprite(res.again);
        this.agSprite.attr({
            x: size.width / 2 -145,
            y: 80
        });
        this.agSprite.setUserData({name:'againBtn'});
        this.addChild(this.agSprite, 16);
        // 分享
        this.shSprite = new HbSprite(res.share);
        this.shSprite.attr({
            x: size.width / 2 +135,
            y: 80
        });
        this.shSprite.setUserData({name:'shareBtn'});
        this.addChild(this.shSprite, 16);
    },

    getTitle: function(){
        var info, num = resultData.hbNum;
        if (num>config.wishNum[3]){
            info = {
                'name' : "红包王者",
                'des1' : "猴犀利啊！猴年春节，你就是红包界最强",
                'des2' : "王者!"
            }
        }else if(num>config.wishNum[2]){
            info = {
                'name': "红包大师",
                'des1' : "距离天下第一，只差一步。"
            }
        }else if(num>config.wishNum[1]){
            info = {
                'name' : "红包高手",
                'des1' : "哎呦，不错哟！抢来的红包够买几包辣条",
                'des2' : "了。"
            }
        }else if(num>config.wishNum[0]){
            info = {
                'name': "红包新手",
                'des1' : "戳破了手机，你也就能抢个几毛钱。多多",
                'des2' : "练习吧骚年。"
            }
        }else{
            info = {
                'name' : "红包菜鸟",
                'des1' : "感觉你春节要错过一个亿啊！你还是再练",
                'des2' : "习一下吧"
            }
        }
        resultData.callMe =info.name;
        return info;
    },
    shareGame: function(){
        var size = cc.winSize;
        this.maskLayer = new cc.LayerColor(cc.color(25,25,25,150));
        this.maskLayer.setTag(101);
        this.addChild(this.maskLayer,18);

        this.shareLink = new cc.Sprite(res.tip);
        this.shareLink.attr({
            x: size.width / 2 + 10,
            y: size.height - 120
        });
        this.shareLink.setTag(102);
        this.addChild(this.shareLink, 20);

        // 创建一个事件监听器 OneByOne 为单点触摸
        var listener1 = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();  // 获取事件所绑定的 target
                return true;
            },
            onTouchMoved: function (touch, event) {
                var target = event.getCurrentTarget();
                return true;
            },
            onTouchEnded: function (touch, event) {
                var target = event.getCurrentTarget();
                var resultLayer = target.getParent();
                resultLayer.shareLink.removeFromParent();     // 删除分享箭头
                resultLayer.removeChildByTag(101,true);      // 删除蒙板

                cc.eventManager.removeListener(listener1);
            }
        });
        cc.eventManager.addListener(listener1, this.maskLayer);
    }
});
var resultScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new resultLayer();
        this.addChild(layer);

        sendCmd.sendAjaxData(2);
    }
});