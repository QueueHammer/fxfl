/*global angular, _, $, window */
/*jshint -W116 */
console.clear();
String.prototype.log = function () {
  console.log(this.toString());
};

$(function () {
  $('div').each(function () {
    var h = Math.floor(Math.random() * 255);
    var s = Math.floor(Math.random() * 100);
    var l = Math.floor(Math.random() * 50) + 25;
    $(this).css('background-color', 'hsla(' + h + ', ' + s + '%, ' + l + '%, 1)');
  });
});

angular.module('fxfl', [])
.directive('fxflContainer', function () {
  function noop() { return 0;}
  return {
    restrict: 'A',
    require:'?fxflContainer',
    controller: function($element, $timeout) {
      //Establish types
      var types = {
          fxflHzPannel: function() { return $($element).width(); },
          fxflVtPannel: function() { return $($element).height(); }
      };
      var pannels = {};
      var type = null;
      
      //Setup interface for directives
      this.register = function (el) {
        //If the element registering is not a vertical or horizontal
        //for now we do not register it
        if(!_.chain(types).keys().contains(el.type).value()) return;
        
        //If we do not have a type set it
        if(!type) type = el.type;
        
        //When we have a type, if a different one registers error
        if(type !== el.type) throw [
          'One type of pannel allowed per container.',
          'This container is already of type: ' + type,
          'So ' + el.type + ' is therefore not allowed'
        ].join('\n');
        
        pannels[el.id] = el;
      };
      
      //Allow directives to leave
      this.unRegister = function (id) {
        delete pannels[id];
      };
      
      //This set the sizes of the child directives
      function setSizes() {
        var hasPct = /(.+)%/;
        
        //Add all the staticly sized pannels
        var staticSize = _.chain(pannels)
        //filter for widths that don't end in %
        .filter(function (p) {
          var size = p.getSize();
          return !hasPct.test(size);
        })
        //Update them incase they value changed since last time
        .reduce(function (m, p) {
          p.useSize();
          return m + Number(p.getSize());
        }, 0).value();
        
        //Determine what space is left. If less than nothing
        //reconize that, and set it to 0;
        var remaining = (types[type] || noop)() - staticSize;
        if(remaining < 0) { remaining = 0; }
        
        //Now work through the relitively spaced elements
        _.chain(pannels)
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
      
      //Bind to the resize event
      $(window).on('resize', _.throttle(setSizes, 50, {leading: false}));
      $timeout(setSizes);
    },
    link:function (s, e, a, c) {
      console.log(c);
    }
  };
})
.directive('fxflHzPannel', function () {
  return {
    restrict: 'A',
    require: '^fxflContainer',
    scope: {fxflHzPannel:'@'},
    link:function (s, e, a, c) {
      c.register({
        id:/\d\.(\d+)/.exec(Math.random().toString())[1],
        type:'fxflHzPannel',
        getSize:function () {
          return a.fxflHzPannel;
        },
        useSize:function () {
          e.width(a.fxflHzPannel);
        },
        setSize:function (w) {
          e.width(w);
        }
      });
    }
  };
})
.directive('fxflVtPannel', function () {
  return {
    restrict: 'A',
    require: '^fxflContainer',
    link:function (s, e, a, c) {
      c.register({
        id:/\d\.(\d+)/.exec(Math.random().toString())[1],
        type:'fxflVtPannel',
        getSize:function () {
          return a.fxflVtPannel;
        },
        useSize:function () {
          e.height(a.fxflVtPannel);
        },
        setSize:function (h) {
          e.height(h);
        }
      });
    }
  };
});