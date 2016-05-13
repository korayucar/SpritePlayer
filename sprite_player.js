/**
 *
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
    self.sourceCount =7;
    self.sourceId =0;
    self.framePerSource=25;
    self.frameCount = self.sourceCount*self.framePerSource; // default value
    self.source_template = "http://mcp-media.s3.amazonaws.com/pvw/E05/8B4/E058B455C5B04E7B8ACE8F5176A2E8AB_pvw-M{id}.jpg";
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
    self.waitingImage = false;
    for(var i = 0 ; i < self.sourceCount ; i ++)
    {
        var image = new Image();
        image.src = self.source_template.replace("{id}", i);
    }

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
            self.play(self.frameRate , self.direction);
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
        dimension = Math.sqrt(self.framePerSource);
        var imageId =  Math.floor(self.initialFrame/self.framePerSource);
        var imageUrl = self.source_template.replace("{id}" , imageId);
        self.videoElements.css("background-image", "url("+imageUrl+ ")")  ;
        self.videoElements.css("background-position", self.frameWidth * ( (self.initialFrame%self.framePerSource) % dimension )+"px "
            + self.frameHeight * (Math.floor((self.initialFrame%self.framePerSource)/dimension )) +"px" );
        for( var i=0; i<self.progressBarElements.length; i++){
            ctx = self.progressBarElements[i].getContext('2d');
            ctx.fillStyle = self.progressBarFutureColor;
            ctx.fillRect(0,0,self.frameWidth,self.progressBarHeight);
            ctx.fillStyle = self.progressBarPastColor;
            ctx.fillRect(0,0,   Math.floor( self.frameWidth * (self.initialFrame + 1) / ( self.frameCount) ), self.progressBarHeight)
        }

    };


    self.play = function (fps , direction){
        self.waitingImage = false;
        if(fps)
            self.setFrameRate(fps);
        if(direction!=-1)
            self.direction = 1;
        self.running = true;
        self.clockId = window.setInterval(function(){
            self.playSingleFrame();
        }, 1000/self.frameRate  );
        self.playSingleFrame();
    };

    self.pause = function (){
        self.waitingImage = false;
        if(self.clockId != -1)
            clearInterval(self.clockId);
        self.running = false;
    };


    self.playBackwards = function (fps){
        self.direction = -1;
        self.play(fps , self.direction);
    };

    self.seek = function (frame){
        self.initialFrame = frame;
        self.renderState();
    };
    self.toggle = function(){
        (self.running ? self.pause : self.play)(self.frameRate , self.direction);
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