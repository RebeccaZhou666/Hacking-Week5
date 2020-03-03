chrome.storage.sync.get("setPage",function(items){document.getElementById('animated').src="/dist/pens/"+items.setPage+"/index.html"});chrome.storage.sync.get("quickBar",function(itemz){if(itemz.quickBar=="true"){document.getElementById("quickbar").style.display="initial";console.log("Quick bar enabled.")}});function moreapps(){var selectedMenu=document.getElementById("more-options").value;if(selectedMenu=="more"){return}
if(selectedMenu=="youtube"){goTo="www.youtube.com"}
if(selectedMenu=="classroom"){goTo="classroom.google.com"}
if(selectedMenu=="keep"){goTo="keep.google.com/u/0/"}
window.location.replace("https://"+goTo)}
document.getElementById("more-options").addEventListener("change",moreapps)
function makeitfriday(){document.getElementById('animated').src="/dist/pens/joke/is-it-friday/its-friday.html"}