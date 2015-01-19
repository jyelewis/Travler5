$("#btnBell").click(function(){
	window.emit('bell');
});

$('#testContext').addTouch();

$.contextMenu({
        selector: '#testContext',
        callback: function(key, options) {
            var m = "clicked: " + key;
            console.log(m);
        },
        items: {
            "edit": {name: "Edit"},
            "cut": {name: "Cut"},
            "copy": {name: "Copy"},
            "paste": {name: "Paste"},
            "delete": {name: "Delete"},
            "sep1": "---------",
            "quit": {name: "Quit"}
        }
    });