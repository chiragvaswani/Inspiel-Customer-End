(function (doc, win, $, undefined) {
  "use strict";
  dataInit();
  scrollEventBinder($);
  timeCellClickEvent($);
  timeSliceClickEvent($);

  function dataInit() {
    var datetimes = [
      // {
      // "day":0,
      // "date":0,
      // "month":"May",
      // "available":10
      // }
    ];
    var scContainer = doc.querySelectorAll(".date-scroll-container")[0];
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (var i = 0; i < 1; i++) {
      var item = {
        // day: days[i % 7],
        // date: i + 1,
        // month: "May",
        // available: "10 available"
      };
      // scContainer.appendChild(getTemplate(interpolate(i, item)));
    }
  }
  function interpolate(idx, dItem) {
    return `<label option-id=${idx} class="timecell" onclick="console.log("hello peeps")">\
            <span class="date-item">
                <input type="radio" name="date" value=${dItem.day}>\
                <span class="fill-box"></span>\
                <span class="time-day">&nbsp;</span>\
                <span class="time-date">End</span>\
                <span class="time-month">&nbsp;</span>\
                <span class="time-available">&nbsp;</span>\
            </span>
        </label>`;
  }
  function getTemplate(html) {
    var template = doc.createElement("template");
    template.innerHTML = html;
    return template.content.firstChild;
  }
  function scrollEventBinder($) {
    var dsc = $(".date-scroll-container")[0];
    $(".scroll-btn.left").on("click", function () {
      dsc.scrollLeft -= dsc.clientWidth;
    });
    $(".scroll-btn.right").on("click", function () {
      dsc.scrollLeft += dsc.clientWidth;
    });
  }
  function timeCellClickEvent($) {
    var $dp = $(".date-pick");
    $(".timecell").click(function () {
      var sidx = +$dp.attr("data-selected-id");
      if (sidx !== -1) {
        $('.timecell[option-id="' + sidx + '"]').removeClass("selected");
        // $(".date-item").toggleClass("selected");
        // $(".date-pick").removeClass("selected");
      }
      $dp.attr("data-selected-id", $(this).attr("option-id"));
      console.log($(this).attr("option-id"));
      //   if (sidx == $(this).attr("option-id")) {
      //     $(this).removeClass("selected");
      //   } else {
      $(this).addClass("selected");
    });
  }
  function timeSliceClickEvent($) {
    var $tp = $(".time-pick");
    $(".time-slice").click(function () {
      var tsidx = +$tp.attr("data-ts-selected-id");
      //   if (tsidx !== -1) {
      //     $('.time-slice[option-id="' + tsidx + '"]').removeClass("selected");
      //   }
      $tp.attr("data-ts-selected-id", $(this).attr("option-id"));
      if ($(this).hasClass("selected")) {
        console.log("I was here mate");
        $(this).removeClass("selected");
        var ele = $(this)[0].childNodes[1];
        ele.removeAttribute("checked");
      } else {
        $(this).addClass("selected");
        console.log($(this)[0]);
        // $(this).input.attr("checked");
        var ele = $(this)[0].childNodes[1];
        ele.setAttribute("checked", true);
      }
    });
  }
})(document, window, $);
