window.onload = function () {
    function updateBatteryStatus(battery) {
      document.querySelector('#charging').textContent = battery.charging ? 'charging' : 'not charging';
      document.querySelector('#level').textContent = battery.level;
      document.querySelector('#dischargingTime').textContent = battery.dischargingTime / 60;
    }

    function changeAnimation(battery){
        if(battery.charging){
            console.log("change to bright");
            document.querySelector('#charging').style.color = '#000000';
            document.querySelector('#new').style.background = '#fdb735';
            document.querySelector('#new').style.transition = "all 0.5s";    
            document.querySelector('#offline').style.visibility = 'hidden';
            document.querySelector('#online').style.visibility = 'visible';
            document.querySelector('#charging').textContent = 'Unplug Me';
            
        }else{ // not charging
            console.log("change to dark");
            document.querySelector('#new').style.background = '#000000';
            document.querySelector('#new').style.transition = "all 0.5s";
            document.querySelector('#online').style.visibility = 'hidden';
            document.querySelector('#offline').style.animation = "fadeIn 1s";
            document.querySelector('#offline').style.animationDelay = "1s";
            // document.querySelector('#offline').style.transitionDelay = "1s";
            document.querySelector('#charging').textContent = 'Plug In Me';
            document.querySelector('#charging').style.color = '#fdb735';
            document.querySelector('#offline').style.visibility = 'visible';
        }
        
    }

    navigator.getBattery().then(function(battery) {
        console.log(battery.charging);
        changeAnimation(battery);

        battery.addEventListener('chargingchange', function() {
          console.log(this.charging);
          changeAnimation(battery);
        });
    });


  };