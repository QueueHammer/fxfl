/*global $ */
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