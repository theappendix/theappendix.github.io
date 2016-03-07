var spinnerOpts = {
  lines: 11, // The number of lines to draw
  length: 8, // The length of each line
  width: 30, // The line thickness
  radius: 22, // The radius of the inner circle
  corners: 1, // Corner roundness (0..1)
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#e06d2a', // #rgb or #rrggbb or array of colors
  speed: 0.7, // Rounds per second
  trail: 54, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: 'auto', // Top position relative to parent in px
  left: 'auto' // Left position relative to parent in px
};

$.fn.berrize = function(options) {
    function buildImgLayer(layer,imgPrefix,lead,width,height) {
        var $layer = $("<div/>").addClass(layer)
        var $img = $("<img/>").attr("width",width).attr("height",height)

        if (layer == "overlay") {
            $img.attr("src",imgPrefix + lead + "_clean.png")
        } else {
            $img.attr("src",imgPrefix + lead + "_orig.png")
        }

        return $layer.append($img)
    }

    this.each(function() {
        var initialize = function(e) {
            var imgLead = settings.cell.data('image-lead')
            settings.cell.height(settings.cell.data('height'))

            var img = new Image()

            e.preventDefault()

            settings.cell.empty()
            settings.cell.addClass('loading-border')
            settings.cell.append(new Spinner(spinnerOpts).spin().el)

            img.src = settings.imgPrefix + imgLead + "_orig.png"
            img.onload = function() {
                var img = new Image()
                img.src = settings.imgPrefix + imgLead + "_clean.png"
                img.onload = function() {
                    settings.cell.trigger('build.berrize')
                }
                settings.cell.removeClass('loading-border')
            }
        }

        var build = function(e) {
            var imgLead = settings.cell.data('image-lead')
            var height = settings.cell.data('height')

            e.preventDefault()
            settings.cell.empty()
            settings.cell.css('height',height)
            settings.cell.append(
                buildImgLayer('overlay',settings.imgPrefix,imgLead,settings.width,height)
            ).append(
                buildImgLayer('underlay',settings.imgPrefix,imgLead,settings.width,height)
            )
        }

        var showOriginal = function(e) {
            var $overlay = settings.cell.find('.overlay')

            e.preventDefault()
            $overlay.stop(true)
            $overlay.animate({ 'opacity': 0 },settings.transitionSpeed)
            $overlay.addClass('hovered')
        }

        var hideOriginal = function(e) {
            var $overlay = settings.cell.find('.overlay')

            e.preventDefault()
            $overlay.stop(true)
            $overlay.animate({ 'opacity': 1 },settings.transitionSpeed)
            $overlay.removeClass('hovered')
        }

        var settings = $.extend({
            cell: $(this),
            width: 900,
            imgPrefix: "production-images/",
            transitionSpeed: 1400,
            lead: "" + $(this).data("image-lead")
        },options)

        settings.cell.on('initialize.berrize',initialize)
        settings.cell.on('build.berrize',build)
        settings.cell.on('mouseenter.berrize',showOriginal)
        settings.cell.on('mouseleave.berrize',hideOriginal)
    })

    return this
}