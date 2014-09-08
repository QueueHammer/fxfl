/*global angular, _, $, window */
/*jshint -W116 */

angular.module('fxfl', [])
.directive('fxflPanel', function () {
  return {
    restrict: 'A',
    require: '?fxflPanel',
    scope: {
      fxflPanelWidth:'@',
      fxflPanelHeight:'@'
    },
    controller: function ($element, $attrs, $timeout) {
      var id = (Math.floor(Math.random() * Math.pow(10, 17))).toString(36);
      console.log('Controller', id);
      var panels = {};
      var type = '';
      var sizeFunction = function() {
        return type == 'width' ? $element.width() : $element.height();
      };
      
      this.register = function (el) {
        //Register the element
        if(panels[el.id]) throw [
          'This element is already registered with it\'s parent'
        ].join(' ');
        
        //Add this element to the list of callbacks
        panels[el.id] =  el;
        
        /*
        //When we have a type, if a different one registers error
        if(type !== el.type) throw [
          'One type of panel allowed per container.',
          'This container is already of type: ' + type,
          'So ' + el.type + ' is therefore not allowed'
        ].join('\n');
        */
      };
      
      var deriveType = _.once(function () {
        //There are no sizes to set if no elements have registered
        if(_.size(panels) === 0) return;
        
        type = _.chain(panels).pluck('type').first().value();
        if(!_.all(panels, function (p) { return type === p.type; }))
          throw [
          'One type of panel allowed per container.',
          'This container is already of type: ' + type,
          'So only ' + type + ' is allowed'
          ].join(' ');
      });
      
      function setSizes() {
        deriveType();
        //There are no sizes to set if no elements have registered
        if(_.size(panels) === 0) return;
        
        //Has percent regex
        var hasPct = /(.+)%/;
        
        //Add all the staticly sized panels
        var staticSize = _.chain(panels)
        //filter for widths that don't end in %
        .filter(function (p) {
          var size = p.getSize();
          return !hasPct.test(size);
        })
        //Update them incase they value changed since last time
        .reduce(function (m, p) {
          //
          var size = p.getSize();
          p.setSize(size);
          //Accumulate the reserved width
          return m + Number(size);
        }, 0).value();
        
        //Determine what space is left. If less than nothing
        //reconize that, and set it to 0;        
        var remaining = sizeFunction() - staticSize;
        if(remaining < 0) { remaining = 0; }
        
        //Now work through the relitively spaced elements
        _.chain(panels)
        //filter for widths that "do" end in %
        .filter(function (p) {
          var width = p.getSize();
          return hasPct.test(width);
        })
        //Now for each take that value and get some of the remaining space
        .each(function (p) {
          var pct = Number(hasPct.exec(p.getSize())[1]);
          var remPart = Math.floor(remaining * (pct/100));
          p.setSize(remPart);
        });
      }
      
      //See if there is a controller above this directive
      var controller = $element.parent().controller('fxflPanel');
      
      //If this is the top controller then we will set sizes on window resize
      if(controller === undefined) {
        $(window).on('resize', _.throttle(setSizes, 50, {leading: false}));
        $timeout(function () {
          setSizes();
        });
        return;
      }
      
      //get any values of attributes we care about
      var width = $attrs.fxflWidth,
          height = $attrs.fxflHeight;
      
      //If both are set, that's not right so let people know.
      if(width !== undefined && height !== undefined) throw [
        'A panel can only size for width or height not both.',
        'Set only the fxfl-panel-width or the fxfl-panel-height attribute.'
      ].join(' ');
      
      //Is this panel for width (horizontal) or height (vertical)?
      var typeIsWidth = width !== undefined;
      
      //Choose the sizing function
      var sizeFunk = function (s) {
        return typeIsWidth ? $element.width(s) : $element.height(s);
      };
      
      //Create the object that will register with the controller
      controller.register({
        id:id,
        type: typeIsWidth ? 'width' : 'height',
        getSize:function () {
          return typeIsWidth ? $attrs.fxflWidth : $attrs.fxflHeight;
        },
        setSize:function (s) {
          sizeFunk(s);
          setSizes();
        }
      });
    }
  };
})
;