/*
 * 
 */
function serifController() {
    this.initialize.apply(this, arguments);
}

serifController.prototype.initialize = function() {
    this.timerId   = null;
    this.nodeStack = [];
    this.callback  = null;
}

serifController.prototype.showSerif = function(origin, target, callback) {
    this.initialize();
    this.parseDom(origin, $(target));
    this.callback = callback;
    this.next();
}
serifController.prototype.showText = function($text, text,  callback) {
  var textIndex = 1;
  var self = this;

  var showOneTxt = function() {
    $text[0].data = text.substring(0, textIndex);

    if (textIndex >= text.length) {
      if (typeof callback == "function")  callback();
      return;
    }

    textIndex++;
    self.timerId = setTimeout(function() {
      showOneTxt();
    }, 100);
  }
  showOneTxt();
}

serifController.prototype.next = function() {
  var next = this.nodeStack.shift();
  if (next) {
    this.show(next);
    return true;
  } else {
    this.callback();
    return false;
  }
}

serifController.prototype.show = (function() {
    var $text, $parent;

    return function($elem) {
      $parent = $elem.data("parent");
      $text   = $elem.data("text");      //テキストノードを取得

      if (!$text) {  //タグの場合:アペンドし次のノードへ進む
        $parent.append($elem);
        this.next();
      } else {      //テキストノードの場合
        $parent.append($text);
        var text = $text.text().replace(/\s/g, "");
        var self = this;
        this.showText($text, text, function() {
          self.next();
        });
      };
    };
})();

/*
   parseDom
   @params {HTMLCollection} elem
   @params {HTMLCollection} parent
*/
serifController.prototype.parseDom = function(elem, parent) {
    var $elem    = $(elem),
        $parent  = $(parent);
    var contents = ($elem && $elem.contents) ? $elem.contents() : $elem; //returns jQuery Object
    var self = this;

    if (contents && contents.length >= 1) {
        var $tag = $($("<div>").append($elem.clone().html("")).html());  //タグのみを取得
        $tag.data("parent", $parent); //親タグの情報を追加
        self.nodeStack.push($tag);
        return $.map(contents.get(), function(val) {
            return self.parseDom(val, $tag);
        });
    } else {
        var text = $elem.text().replace(/\s/g, "") ;
        if (text) {
            var textContainer = $("<div>"); //textNodeを運ぶ仮のDivタグを作成(*textNodeのjQueryオブジェクトではdataメソッドを使用出来ない)
            textContainer.data("text", $elem);
            textContainer.data("parent", $parent);
            self.nodeStack.push(textContainer);
        }
        return elem;
    }
}

serifController.prototype.stopShowing = function() {
    if (this.timerId)
        clearTimeout(this.timerId);
    delete this.nodeStack;
}

