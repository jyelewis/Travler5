window.UI.on('load', function(){
    window.UI.DOM.on('resizestart', function(){
        $('#windowCover').show();
    });
    window.UI.DOM.on('resizestop', function(){
        $('#windowCover').hide();
    });
    
    window.UI.DOM.on('dragstart', function(){
        $('#windowCover').show();
    });
    window.UI.DOM.on('dragstop', function(){
        $('#windowCover').hide();
    });

    window.UI.on('blur', function(){
        $('#windowCover').show();
    });
    window.UI.on('focus', function(){
        $('#windowCover').hide();
    });
});