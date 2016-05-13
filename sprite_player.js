/**
 *
 * !!This player assumes n by n sprite images as data source. (assignment written this way)
 * the
 * @param selector  the selector of the intended vide players (allowed to be multiple)
 * @constructor
 */
function FramePlayer (selector ) {
    var self = this;
    self.elements = $(selector);
    self.frameWidth = 128;
    self.frameHeight= 72;
    self.progressBarHeight = 20;
    self.elements.html("<div class='video'></div><canvas width='"+self.frameWidth+"' height='"+self.progressBarHeight+"' class='progressbar'></canvas>");
    self.progressBarPastColor = "#999";
    self.progressBarFutureColor = "#666";
    self.frameCount = 25; // default value
    self.source = "http://mcp-media.s3.amazonaws.com/pvw/E05/8B4/E058B455C5B04E7B8ACE8F5176A2E8AB_pvw-M0.jpg";
    self.frameRate = 10; // the unit is fps
    self.clockId = -1;
    self.initialFrame = 0;
    self.direction = 1;
    self.running = false;
    self.videoElements = self.elements.children(".video");
    self.progressBarElements = self.elements.children(".progressbar");
    self.videoElements.height(self.frameHeight);
    self.videoElements.width(self.frameWidth);
    self.progressBarElements.width(self.frameWidth);
    self.progressBarElements.height(self.progressBarHeight);

    /**
     *
     * @param rate  frame rate in fps. More than 100 is ignored. Nonpositive is illegal. Fractions are valid.
     */
    self.setFrameRate = function (rate){
        if(rate <= 0 )
            throw "make sense to me";
        self.frameRate = Math.min (rate , 100);
        if(self.running)
        {
            self.pause();
            self.play();
        }
    };


    self.playSingleFrame = function(){
        self.renderState();
        if(self.direction  > 0) self.initialFrame++;
        else self.initialFrame--;
        self.initialFrame %= self.frameCount;
        if(self.initialFrame < 0) self.initialFrame += self.frameCount;
    };

    self.renderState = function () {
        dimension = Math.sqrt(self.frameCount);

        self.videoElements.css("background-image", "url("+self.source+")");
        self.videoElements.css("background-position", self.frameWidth * (self.initialFrame % dimension )+"px " + self.frameHeight * (Math.floor(self.initialFrame/dimension )) +"px" );
        for( var i=0; i<self.progressBarElements.length; i++){
            ctx = self.progressBarElements[i].getContext('2d');
            ctx.fillStyle = self.progressBarFutureColor;
            ctx.fillRect(0,0,self.frameWidth,self.progressBarHeight);
            ctx.fillStyle = self.progressBarPastColor;
            ctx.fillRect(0,0,   Math.floor( self.frameWidth * (self.initialFrame + 1) /self.frameCount) , self.progressBarHeight)
        }

    };


    self.play = function (fps){
        if(fps)
            self.setFrameRate(fps);
        self.direction = 1;
        self.running = true;
        self.clockId = window.setInterval(function(){
            self.playSingleFrame();
        }, 1000/self.frameRate  );
        self.playSingleFrame();
    };

    self.pause = function (){
        if(self.clockId != -1)
            clearInterval(self.clockId);
        self.running = false;
    };


    self.playBackwards = function (fps){
        self.direction = -1;
        self.play(fps);
    };

    self.seek = function (frame){
        self.initialFrame = frame;
        self.renderState();
    };
    self.toggle = function(){
        (self.running ? self.pause : self.play)();
    };


    /**
     * @param count integer value of frame count. Must be a perfect square of a nonzero integer.
     */
    self.setFrameCount = function (count){
        if(n <= 0 || Math.sqrt(n) % 1 === 0) throw "Illegal argument. Frame count must be square of a positive integer";
            self.frameCount =  count;
    };


    /**
     * Changes the data source. Legal to use on the fly during animation.
     * @param url the sprite url
     */
    self.setSprite = function(url){
        if(!self.running)
            self.renderState();
        self.source = url;
    };

    self.videoElements.click(function(){
        self.toggle();
    });
    self.progressBarElements.click(function(e){
        self.pause();
        self.seek(Math.floor( (e.offsetX * self.frameCount) / self.frameWidth));
        self.renderState();
    });
    self.renderState();

}