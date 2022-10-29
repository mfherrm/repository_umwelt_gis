let btnNext = $("#next");
let btnPrev = $("#previous");

let pages = $(".page").length-1

let pageIndex = 0;

showPage();

btnNext.on("click",function(){
    hidePage();
    pageIndex < pages? pageIndex++ : pageIndex; 
    showPage();
    buttonShowHide();
})

btnPrev.on("click", function(){
    hidePage();
    pageIndex > 0 ? pageIndex-- : 0;
    showPage();
    buttonShowHide();
})

function buttonShowHide(){
    pageIndex == pages ? btnNext.css("visibility","hidden") : btnNext.css("visibility","visible");
    pageIndex == 0 ? btnPrev.css("visibility","hidden"): btnPrev.css("visibility","visible");
}

function showPage(){
    $("#page"+pageIndex).removeClass("hide").addClass("show");
}

function hidePage(){
    $("#page"+pageIndex).removeClass("show").addClass("hide");
}



