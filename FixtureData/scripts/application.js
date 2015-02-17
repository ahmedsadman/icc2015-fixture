// Author: Sadman Muhib Samyo 

function StatsButton(ID) {
	var Width = $(window).width();
	if (Width < 767) {
		$(".stats, .heading").hide();
		$("span", ID).text("Show ");
	} else {
		$(".stats, .heading").show();
	}
	
	$(ID).toggle(function() {
		$("span", ID).text("Hide ");
		$(".stats, .heading").slideDown(300, "linear");
	}, function() {
		$("span", ID).text("Show ");
		$(".stats, .heading").slideUp(300, "linear");
	});
}

function ToTop() {
	var element = '<div id="to_top"><img src="FixtureData/images/totop.png" alt="Go to Top"></div>';
	$("body").prepend(element);
	$("#to_top").click(function() {
		$("html, body").animate({
			scrollTop: $("#topAnchor").offset().top + "px"
		}, {
			duration: 750,
			easing: "swing"
		})
	});
	$(window).scroll(function() {
		var winHeight = $(window).height(),
			extraDown = $(document).scrollTop();
		if (extraDown > winHeight) {
			$("#to_top").fadeIn(300);
		} else {
			$("#to_top").fadeOut(300);
		}
	});
	
}


function saveData(Obj, team, isChecked) {
	var parentIndex = Obj.parent().parent().parent().index();
	// console.log("Table operation in ", parentIndex+1);
	
	// sets the variable depending on the status of the checkbox passed in this function
	var curr = (isChecked) ? "1" : "0";
	
	// checks the checkbox condition of the opposing team
	var opposeObj = Obj.parent().find(":checkbox").filter(function(i) {
		return i != Obj.index();
	});
	var oppose = opposeObj.attr("checked") ? "1" : "0";
	var data = (Obj.index() == 0) ? curr + " " + oppose : oppose + " " + curr; // exp. data = "0 1" means first checkbox unchecked, second one checked
	
	localStorage.setItem(parentIndex.toString(), data);
}


function loadData() {
	$("#fixture tr").each(function(i) {
		var data = localStorage.getItem(i.toString());
		if (data != null) {
			var processedData = data.split(" ");
			var Value1 = (processedData[0] == "1") ? true : false;
			var Value2 = (processedData[1] == "1") ? true : false;
			
			if (Value1) {
				$(this).find(":checkbox").eq(0).attr("checked", Value1).change();
			}
			if (Value2) {
				$(this).find(":checkbox").eq(1).attr("checked", Value2).change();
			}
		} else {
			// do nothing
		}
	})
}


function UpdateStats(teamName1, teamName2, element, status, boxChecked) {
	var target = element.parent().find("td");
	var pointsField = target.eq(4),
		drawField = target.eq(1),
		winField = target.eq(2),
		lostField = target.eq(3);
		
	var oldScore = pointsField.text(),
		newScore = (status) ? parseInt(oldScore, 10) + 3 : parseInt(oldScore, 10) - 3; // +-3 points for each win/loss
	var oldWin = winField.text();
		newWin = (status) ? parseInt(oldWin, 10) + 1 : parseInt(oldWin, 10) - 1;

	pointsField.text(newScore.toString());
	winField.text(newWin.toString());
	
	/* then checks if the match is a draw. If so -2 for each team. Note that, as current algorithm works, +3 will be added for 
	each team when the user checks both boxes (draw), which is impractical. The following condition does 
	the calculation 3-2 = 1(draw point) for each team and overcomes the problem */
	var opposeTeam = $("tr", ".stats").filter(function(i) {
			return $(this).find("td").eq(0).text() == teamName2;
		});
		
	var target_oppose = opposeTeam.find("td");
	var pointsField_oppose = target_oppose.eq(4);
	var iter_points = [pointsField_oppose, pointsField],
		drawField_oppose = target_oppose.eq(1),
		winField_oppose = target_oppose.eq(2),
		lostField_oppose = target_oppose.eq(3);
	var iter_win = [winField, winField_oppose];
	var iter_lost = [lostField, lostField_oppose];
	var iter_draw = [drawField, drawField_oppose];
	
	// changes the LOST table for the opposing team
	var newLost = status ? parseInt(lostField_oppose.text(), 10) + 1 : parseInt(lostField_oppose.text(), 10) - 1;
	lostField_oppose.text(newLost.toString());
	
	// handles match draw
	if (boxChecked == 2 && status) {
		// +1 points for each team, previous points was 3 for both teams, so (3-2) = 1 does the job
		for (var a = 0; a < iter_points.length; a++) {
			var newScore = parseInt(iter_points[a].text(), 10) - 2;
			iter_points[a].text(newScore.toString());
		}
		
		// restores the Win field to it's previous state (-1), both teams can't win at the same time
		for (var a = 0; a < iter_win.length; a++) {
			var newWin = parseInt(iter_win[a].text(), 10) - 1;
			iter_win[a].text(newWin.toString());
		}
		
		/* As current algorithm works, 1 is added in the lost field when the match is draw (unusual). The following 
		overcomes the problem and also adds +1 to the draw field */
		for (var a = 0; a < iter_lost.length; a++) {
			var newLost = parseInt(iter_lost[a].text(), 10) - 1;
			iter_lost[a].text(newLost.toString());
			
			var newDraw = parseInt(iter_draw[a].text(), 10) + 1;
			iter_draw[a].text(newDraw.toString());
		}
	} 
	// when user checks both checkboxes, then unchecks one 
	/* In this state, both the points are +1. So when one box is unchecked (it's a change event, so actually we get the unchecked object), 
	it is (PreviousScore) - 1. And we need to restore the opposing team's score (which is checked). It has got +1 in it, so to restore +1+2 = 3 (win point)
	does the trick */
	else if (boxChecked == 1 && !status) {
		pointsField.text((parseInt(oldScore, 10) - 1).toString());
		var newScore = parseInt(pointsField_oppose.text(), 10) + 2;
		pointsField_oppose.text(newScore.toString());
		
		// restores win field
		for (var a = 0; a < iter_win.length; a++) {
			var newWin = parseInt(iter_win[a].text(), 10) + 1;
			iter_win[a].text(newWin.toString());
		}
		
		// restores lost and draw field as expected
		for (var a = 0; a < iter_lost.length; a++) {
			var newLost = parseInt(iter_lost[a].text(), 10) + 1;
			iter_lost[a].text(newLost.toString());
			
			var newDraw = parseInt(iter_draw[a].text(), 10) - 1;
			iter_draw[a].text(newDraw.toString());
		}
	} else {
		// do nothing
	}
} // end of function UpdateStats


$(document).ready(function() {
	StatsButton("#statsBtn");
	ToTop();
	/* $(document).dblclick(function() {
		localStorage.clear();
		console.log("Local storage cleared successfully");
	}); */
	
	// if (navigator.isOnline) alert("You are not online");
	// assigns the name attribute to all checkbox according to it's team name
	$(":checkbox").each(function(i) {
		var p = $(this).parent().parent().parent(); // table -> tr(destination) -> td-> form (closest parent) -> theObject
			target = $(this);
		var val1 = p.find(".team1").text();
		var val2 = p.find(".team2").text();
		
		// even elements get the value of .team2 class, odd elements get the value of .team1 class
		((i % 2) == 0) ? target.attr("name", val1) : target.attr("name", val2);
	});
	// var spc = "f" + "oo",
		// spc1 = "ter";
	
	// if ($(spc+spc1).text().length != 84) $(document).empty();
	
	// updates the stats table according to the changes of win/loss provided by the user 
	$(":checkbox").change(function() {
		console.clear();
		var Team = $(this).attr("name"),
			eventPlace = $(this);
		var	status = ($(this).attr("checked")) ? true : false;
		var	boxChecked = $(this).parent().find(":checked").toArray().length; // used to determine match draws (both ticks from the user)
		var Team2 = $(":checkbox", $(this).parent()).filter(function(i) {
			return $(this).attr("name") != Team;
		}).attr("name");
		$(".stats td").each(function() {
			if ($(this).text() == Team) {
				UpdateStats(Team, Team2, $(this), status, boxChecked);
			}
		});
		saveData($(this), Team, status);
	}); // end of checkbox event handling
	
	loadData();
});
