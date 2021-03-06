/*global angular, _, $, window, setTimeout */
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
    controller: function ($scope, $element, $attrs) {
      var id = (Math.floor(Math.random() * Math.pow(10, 17))).toString(36);
      var panels = {};
      var type = '';
      var enabled = true;
      
      var sizeFunction = function() {
        return type == 'width' ? $element.width() : $element.height();
      };
      
      //See if there is a controller above this directive
      var controller;
      if ($attrs.fxflWidth || $attrs.fxflHeight) controller = $element.parent().controller('fxflPanel');
      
      //----------------------------------------------
      var startUpdate = _.noop();
      
      function primeUpdate() {
        startUpdate = _.once(function () {
          setTimeout(function () {
            doUpdate();
          });
        });
      }
      
      //Done in two parts because my editor complained...
      function doUpdate() {
            setSizes();
            primeUpdate();
      }
      
      primeUpdate();
      //----------------------------------------------
      
      this.requestUpdate = function () {
        //If this is but a step along the chain, propagate
        if(controller) {
          controller.requestUpdate();
          return;
        }
        
        //If this the top of the chain, queue an update
        startUpdate();
      };
      
      this.register = function (el) {
        //Register the element
        if(panels[el.id]) throw [
          'This element is already registered with it\'s parent'
        ].join(' ');
        
        //Add this element to the list of callbacks
        panels[el.id] =  el;
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
        
      //Has percent regex
      function testSzie(str) {
        var regEx = /^(\d+(\.\d+)?)(%)?$/;
        var result = regEx.exec(str) || [];

        return {
          match: !!result[0],
          number: result[1],
          isPercent: !!result[3]
        };
      } 
      
      function setSizes() {
        deriveType();
        //There are no sizes to set if no elements have registered
        if(_.size(panels) === 0 || !enabled) return;
        
        //Break panels into the two sets we will work with
        var workingSets = _.groupBy(panels, function (p) {
          var size = p.getSize();
          return !testSzie(size).isPercent ? 'fx' : 'fl';
        });
        
        //Queue up the updates to perform
        var updateValues = {};
        
        //Add all the staticly sized panels
        var staticSize = _.chain(workingSets.fx)
        //Update them incase they value changed since last time
        .reduce(function (m, p) {
          //
          var size = p.getSize();
          updateValues[p.id] = size;
          //Accumulate the reserved width
          return m + Number(size);
        }, 0).value();
        
        //Determine what space is left. If less than nothing
        //reconize that, and set it to 0;        
        var remaining = sizeFunction() - staticSize;
        if(remaining < 0) { remaining = 0; }
        
        //Now work through the relitively spaced elements
        _.chain(workingSets.fl)
        //For each take that value and get some of the remaining space
        .each(function (p) {
          var pct = Number(testSzie(p.getSize()).number);
          var remPart = remaining * (pct/100);
          updateValues[p.id] = remPart;
        });
        
        //Now update the panels according to their values and if they are
        //this is a width type panel or not.
        
        if(type == 'width') {
            var localHeight = $element.height();
            _.each($element.children(), function (d) {
              var el = $(d);
              el.height(localHeight);
            }, 0);
        }
        
        _.each(updateValues, function (v, id) {
          panels[id].setSize(v);
        });
        
        if(type == 'width') {
          _.reduce($element.children(), function (m, d/*, i*/) {
            var el = $(d);
            el.css({left: m});
            m = m + el.width();
            return m;
          }, 0);
        }
      }
      
      //Watch to enable and disable the directive
      $scope.$watch(function () {
        var attrVal = $attrs.fxflPanel;
        
        //If the value is not set we default to enabled
        if(attrVal === ''  || attrVal === undefined) return true;
        
        var ret = $scope.$parent.$eval($attrs.fxflPanel);
        return ret;
      }, function (newValue/*, oldValue*/)  {
        if(newValue) {
          enabled = true;
          $element.show();
        }
        else {
          enabled = false;
          $element.hide();
        }
        if(controller) controller.requestUpdate();
        else startUpdate();
      });
      
      //If this is the top controller then we will set sizes on window resize
      if(controller === undefined) {
        //Bind to the global resize event
        $(window).on('resize', _.throttle(setSizes, 50, {leading: false}));
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
      
      function resolveAttrToUseable(str) {
        //If the value of the attribute is useable as is return
        if(testSzie(str).match) return str;
        
        //Find any variables and evaluate them with scope
        str = str.replace(/[A-Za-z]\w*/g, function (match) {
          return $scope.$parent.$eval(match);
        });
        
        //return the new string
        return $scope.$parent.$eval(str);
      }
      
      //Create the object that will register with the controller
      controller.register({
        id:id,
        type: typeIsWidth ? 'width' : 'height',
        getSize:function () {
          //If the element is not enabled then report 0 to remove it
          if(!enabled) return 0;
          
          var val = typeIsWidth ? $attrs.fxflWidth : $attrs.fxflHeight;
          return resolveAttrToUseable(val);
        },
        setSize:function (s) {
          //If the element is not enabled then dont propagate
          if(!enabled) return;
          sizeFunk(s);
          setSizes();
        }
      });
      
      //Setup a watch that will allow updates to be queued during digest
      $scope.$watch(function () {
        //Get the value of the attribute we want
        var val = typeIsWidth ? $attrs.fxflWidth : $attrs.fxflHeight;
        
        //Resolve it to a value we will be able to use
        return resolveAttrToUseable(val);
      }, function (/*newValue, oldValue*/)  {
        controller.requestUpdate();
      });
    }
  };
});