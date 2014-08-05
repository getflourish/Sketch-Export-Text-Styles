// Namespaced library of functions common across multiple plugins
var inventory = inventory || {};

// Get the path of the plugin, without the name of the plugin
// todo: Could need some regex love for sure

var pluginPath = sketch.scriptPath;
var lastSlash = pluginPath.lastIndexOf("/");
var basePath = pluginPath.substr(0, lastSlash);

inventory.config = {
	background_image: basePath + "/assets/pattern.png",
	pageName: "Style Sheet",
	textStylePlaceholder: "The big brown fox jumps over the lazy dog.",
}

inventory.common = {
	// Adds an artboard to the given page
	addArtboard: function(page, name) {
		artboard = [MSArtboardGroup new]
		frame = [artboard frame];
		frame.width = 400;
		frame.height = 400;
		frame.constrainProportions = false;
		page.addLayer(artboard);
		artboard.setName(name);
		return artboard;
	},
	addCheckeredBackground: function(artboard) {
		var layer = artboard.addLayerOfType("rectangle");
		layer.frame().setWidth(artboard.frame().width())
		layer.frame().setHeight(artboard.frame().height())
		layer.style().fills().addNewStylePart();
		layer.style().fill().setFillType(4);
		layer.setName("Background");

		var image = [[NSImage alloc] initWithContentsOfFile:inventory.config.background_image];

		layer.style().fill().setPatternImage(image)
		return layer;
	},
	// Adds a new page to the document
	addPage: function(name) {
		// look for existing style sheet, otherwise create a new page with the styles
		var page = doc.addBlankPage();
		page.setName(name);
		[doc setCurrentPage:page]
		inventory.common.refreshPage();
		return page;
	},
	// Returns the page if it exists or creates a new page
	getPageByName: function(name) {
		for (var i = 0; i < doc.pages().count(); i++) {
			var page = doc.pages().objectAtIndex(i);
			if (page.name() == name) {
				[doc setCurrentPage:page]
				return page;
			}
		}
		var page = inventory.common.addPage(name);
		return page;
	},
	addTextLayer: function(target, label) {
		var textLayer = target.addLayerOfType("text");
		textLayer.setStringValue(label)
		textLayer.setName(label)
		return textLayer;
	},
	// Returns an artboard from a given page
	getArtboardByPageAndName: function(page, name) {
		for (var i = 0; i < page.artboards().count(); i++) {
			var artboard = page.artboards().objectAtIndex(i);
			if (artboard.name() == name) {
				[artboard select:true byExpandingSelection:false]
				return artboard;
			}
		}
		var artboard = inventory.common.addArtboard(page, name);
		return artboard;
	},
	isIncluded: function(arr, obj) {
	  return (arr.indexOf(obj) != -1);
	},
	refreshPage: function() {
		var c = [doc currentPage]
		[doc setCurrentPage:0]
		[doc setCurrentPage:([[doc pages] count] - 1)]
		[doc setCurrentPage:c]
	},
	// Removes all layers from an artboard
	removeAllLayersFromArtboard: function(artboard) {

		var layers = [[artboard children] objectEnumerator]
		while (layer = [layers nextObject]) {
			artboard.removeLayer(layer);
		}
	},
	resize: function(layer, width, height) {
		var frame = layer.frame();
		frame.setWidth(width);
		frame.setHeight(height);
	},
	// Saves a string to a file
	save_file_from_string: function (filename, the_string) {
  		var path = [@"" stringByAppendingString:filename],
      	str = [@"" stringByAppendingString:the_string];

  		if (in_sandbox()) {
  		  sandboxAccess.accessFilePath_withBlock_persistPermission(filename, function(){
  		    [str writeToFile:path atomically:true encoding:NSUTF8StringEncoding error:null];
  		  }, true)
  		} else {
  		  [str writeToFile:path atomically:true encoding:NSUTF8StringEncoding error:null];
  		}
	}
}

inventory.view = {
	centerTo: function(layer) {
		var selected_object = layer;
    	var view = [doc currentView];
		[view centerRect:[selected_object absoluteRect]]
	},
	zoomTo: function (layer) {
		var view = [doc currentView];
		[view zoomToFitRect:[layer absoluteRect]]
	}
}

inventory.css = {
	/**
 	* createRuleSetStr by Tyler Gaw https://gist.github.com/tylergaw/adc3d6ad044f5afac446
 	**/

	createRuleSetStr: function (layer) {
 		var str = '';
 		var selector = '.' + layer.name().toLowerCase().replace(/ /gi, '-');
 		var attrs = layer.CSSAttributes();

 		str += selector + ' {';

 		for (var i = 0; i < attrs.count(); i += 1) {
 			var declaration = attrs.objectAtIndex(i);

    		if (declaration.indexOf('/*') < 0) {
    			str += '\n\t' + declaration;
    		}
		}
		str += '\n}';
		return str;
	},

	generateStyleSheet: function (layers) {
		var stylesheet = '';
		var stylesheet = "/* Text Styles from Sketch */";

		for (var i = 0; i < layers.count(); i += 1) {
			var layer = layers.objectAtIndex(i);

    		// only get CSS for text layers
    		if([layer isKindOfClass:MSTextLayer]) {
    			stylesheet += '\n\n' + inventory.css.createRuleSetStr(layer);
    		}
		}
		return stylesheet;
	}
}