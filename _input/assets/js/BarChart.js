//	 ______  _    _  _   _   _____  _______  _____  ____   _   _   _____
//	|  ____|| |  | || \ | | / ____||__   __||_   _|/ __ \ | \ | | / ____|
//	| |__   | |  | ||  \| || |        | |     | | | |  | ||  \| || (___
//	|  __|  | |  | || . ` || |        | |     | | | |  | || . ` | \___ \
//	| |     | |__| || |\  || |____    | |    _| |_| |__| || |\  | ____) |
//	|_|      \____/ |_| \_| \_____|   |_|   |_____|\____/ |_| \_||_____/
//

//
//  Start creating categorical scales map integers to colors from here.
//
function createChartLegend(mainDiv, groupPlan, arrowColor, labelFontColor)
{
	return new Promise(function (resolve, reject) {

		//
		//	1.	create an ordinal scale.
		//
		var map_value = d3.scaleOrdinal([arrowColor]);

		//
		//  2.  Get the exact div id, removing # from value.
		//
		var main_div_name = mainDiv.substr(1, mainDiv.length);

		//
		//  3.  Showing indicators on top with their specification.
		//
		$(mainDiv).before("<div id='Legend_"
			+ main_div_name
			+ "' class='pmd-card-body' style='margin-left: 65px;margin-top:0; margin-bottom:0;'></div>");

		//
		//	4.	Array of arrow and labels to show on top of chart.
		//
		var indicator_list = groupPlan;

		//
		//	5.	Loop to append indicators sequentially.
		//
		indicator_list.forEach(function (obj) {

			//
			//	1.	Getting color code of each indicator
			//
			var clolor_code = map_value(obj.arrow);

			//
			//	2.	Appending html that will show indicators on top
			//
			$("#Legend_" + main_div_name)
			.append("<span class='team-graph team1' style='display: inline-block; margin-right:10px;float: left;'><span style='width: 16px;height: 10px;display: inline-block;color: "
				+ arrowColor
				+ ";font-size: 14px;'>"
				+ obj.arrow
				+ "</span><span style='padding-top: 0;font-family:Source Sans Pro, sans-serif;font-size: 13px;display: inline;color:"
				+ labelFontColor
				+ "'>"
				+ obj.text
				+ " </span></span>");

		});

		//
		//	6.	Move to the next promise.
		//
		return resolve();

	})
}

//
//  Start drawing the whole chart here.
//
function drawStackChart(chartConfig)
{
	//
	//	1.	Promise to ensure that chart has been drawn without error to
	//		proceed further task.
	//
	return new Promise(function (resolve, reject) {

		//
		//  1.  select an element from the document.
		//
		var svg_bar = d3.select("." + chartConfig.svgClass);

		//
		//  2.  select an element from the document.
		//
		var margin = chartConfig.margin;

		//
		//  3.  Get width of bar.
		//
		var width_bar = +svg_bar.attr("width");

		//
		//  4.  Get height of bar.
		//
		var height_bar = +svg_bar.attr("height");

		//
		//  5.  Finalizing the value of bar's height.
		//
		height_bar = height_bar - (margin.top + margin.bottom);

		//
		//  6.  Finalizing the value of bar's width.
		//
		width_bar = width_bar - margin.left - margin.right;

		//
		//  7.  Storing the investment data into investment_list variable".
		//
		var investment_list = chartConfig.data;

		//
		//  8.  Get id name of container div.
		//
		var container_div = chartConfig.containerDiv;

		//
		//  9.  Get font style for bar.
		//
		var font_style = chartConfig.fontStyle;

		//
		//  10.  Get arrow style for bar.
		//
		var arrow_style = chartConfig.arrowStyle;

		//
		//	11.	Creating array of investType obj to store property in each
		//		object.
		//
		var investment_list = Object.keys(investment_list).map(function (key) {

			//
			//	1.	assigning value to investType variable inside object.
			//
			investment_list[key]["investType"] = key;

			//
			//	 2.	move to next cursor.
			//
			return investment_list[key];

		});
		
		//
		//  12.  Sorting investment in ascending order using order value of it.
		//
		investment_list = investment_list
			.sort(function (investment_a, investment_b) {

				//
				//	1.	Return number for sorting
				//
				return investment_a.order - investment_b.order;

			});
			
		
		//
		//	14.	Create an ordinal band scale(The bars measuring requirements).
		//
		var yBar = d3.scaleBand()
			.rangeRound([height_bar, 0])
			.padding(0.3);
		
		//
		//	15.	Set the input domain(invest type) that Appears on y-axis.
		//
		yBar.domain(investment_list.map(function (investment) {

			//
			//	1.	Returns the type of investment
			//
			return investment.investType

		}));

		//
		//	16.	Create a quantitative linear scale.
		//
		var xBar = d3.scaleLinear().rangeRound([0, width_bar]);

		//
		//	17.	Compute the maximum value in an array.
		//
		var maxX = d3.max([d3.max(Object.keys(investment_list)
			.map(function (index) {

			//
			//	1.	Return specific current value of investment.
			//
			return investment_list[index].current;

			})), d3.max(Object.keys(investment_list).map(function (index) {

			//
			//	1.	Return specific recommended value of investment.
			//
			return investment_list[index].recommended;

		}))]);

		//
		//	18.	Compute the minimum value in an array.
		//
		var minX = d3.min([d3.min(Object.keys(investment_list)
			.map(function (index) {

			//
			//	1.	Return specific current value of investment.
			//
			return investment_list[index].current;

		})), d3.min(Object.keys(investment_list).map(function (index) {

			//
			//	2.	Return specific recommended value of investment.
			//
			return investment_list[index].recommended;

		}))]);

		//
		//	19.	Set the input domain (e.g:0-1000) appears at bottom to scale.
		//
		xBar.domain([(minX - 1000) > 0 ? (minX - 1000) : 0, maxX]);

		//
		//	20.	Compute the maximum value in an array.
		//
		var maximum_distance = d3.max(investment_list, function (investment) {

			//
			//	1.	Check if current value is greater than recommended.
			//
			if (investment.current > investment.recommended)
			{
				//
				//	1.	Return differnce between current and recommended invest.
				//
				return (xBar(investment.current) - xBar(investment.recommended));
			}
			//
			//	2.	Check if current value is less or equal to recommended.
			//
			if ((investment.current <= investment.recommended))
			{
				//
				//	1.	Return differnce between recommended and current invest.
				//
				return (xBar(investment.recommended) - xBar(investment.current));
			}
			
		});

		//
		//	21.	Create, append and select new elements.
		//
		svg_bar.append("g").attr("class", "barRect");

		//
		//	22.	Select multiple elements from the document.
		//
		var gBar = d3.selectAll(".barRect");

		//
		//	23.	Select multiple descendants for each selected element.
		//
		var rect_bar = gBar.selectAll("rect").data(investment_list);

		//
		//	24.	Get the enter selection and create, append and select new
		//		elements.
		//
		rect_bar.enter().append("rect").attr("class", function(investment) {

				//
				//	1.	Returns class name reactbar
				//
				return "reactBar";

			})
			.attr("opacity", 0.9)
			.attr("fill", function (investment) {

				//
				//	1.	Return color of investment rectangle to identify.
				//
				return investment.color;

			})
			.attr("cursor", "pointer")
			.attr("data", function (investment) {

				//
				//	1.	Returns of investment properties in the stirng form.
				//
				return JSON.stringify(investment);

			})
			.attr("width", function (investment) {

				//
				//	1.	Returns the value of invest to use as width.
				//
				return xBar(investment.current);

			})
			.attr("x", function (investment) {

				//
				//	1.	Returns the value of left margin.
				//
				return margin.left;

			})
			.attr("y", function (investment) {

				//
				//	1.	Returns the start of the corresponding band.
				//
				return yBar(investment.investType);

			})
			.attr("height", yBar.bandwidth())
			.on("mouseenter", function (investment) {

				//
				//	1.	Select an element and and set opacity.
				//
				d3.select(this).style("opacity", 1);

				//
				//	2.	On mouse enter,show detail in tooltip.
				//
				showDetail($.extend(true, {}, investment), d3.event,
				 container_div);

			}).on("mousemove", function (investment) {

				//
				//	1.	Select an element and and set opacity.
				//
				d3.select(this).style("opacity", 1);

				//
				//	2.	On mousemove,show detail in tooltip at cursor position.
				//
				showDetail($.extend(true, {}, investment), d3.event,
				container_div);

			}).on("mouseout", function (investment) {

				//
				//	1.	Select an element and and set opacity.
				//
				d3.select(this).style("opacity", 0.9);

				//
				//	2.	On mouseout,hide detail shown in tooltip.
				//
				hideTooltip();

			});

		//
		//  25.  Display the current invested value on chart.
		//
		
		var text_current = rect_bar.enter().append("text")
			.attr("y", function (investment) {

				//
				//	1.	Subtracting 0.1 times width value of band from start
				//	    value of the corresponding band and returns the output
				//		to show current invested value exactly on top of bar.
				//
				var sdf = yBar(investment.investType)
				
				return yBar(investment.investType) - (yBar.bandwidth() * 0.1);

			})
			.attr("x", function (investment) {

				//
				//	1.	Calculate desired value and return it to 
				//		provide the value to  x attribute of element.
				//
				return margin.left + (xBar(investment.current) / 2);

			})
			.style("font-size", font_style.barText.fontSize || "12px")
			.style("font-weight", font_style.barText.fontWeight || "bold")
			.style("fill", font_style.barText.fontColor || "#B3B3B3")
			.text(function (investment) {

				//
				//	1.	Returns text to write it inside selection.
				//
				return "$" + investment.current;

			});
		
		//
		//	26.	Place the current invested value.
		//
		text_current.attr("x", function (investment) {

			//
			//	1.	Returns value to assign to the x attribute.
			//
			return parseFloat(d3.select(this).attr("x")) -
			(parseFloat(d3.select(this).node().getBBox().width) / 2);

		});
		
		//
		//  27.  Making the difference to indicate needness as less/more.
		//
		//		CBT: for rectangle with black Border
		//
		rect_bar.enter().append("rect")
			.attr("class", function (investment) {

				//
				//	1.	Returns value to assign to the rect element as a class.
				//
				return "reactBlackBorderBar";

			})
			.attr("opacity", 1)
			.attr("fill", function (investment) {

				//
				//	1.	Returns value 'transparent' to make element
				//		transparent.
				//
				return "transparent";

			})
			.attr("stroke-opacity", 1)
			.attr("stroke-width", "0.5px")
			.attr("stroke", function (investment) {

				//
				//	1.	Check if value of current and recommended are not
				//		equal.
				//
				if (investment.current != investment.recommended)
				{
					//
					//	1.	Returns color to the element as a stroke attribute.
					//
					return "black";
				}

				//
				//	2.	Check if value of current and recommended are equal.
				//
				if (investment.current == investment.recommended)
				{
					//
					//	1.	Returns none to the element as a stroke attribute.
					//
					return "none";
				}
			})
			.attr("width", function (investment) {

				//
				//	1.	Check if differnce of current and recommended value is
				//		 greater than 0.
				//
				if (xBar(investment.current) - xBar(investment.recommended) > 0) 
				{
					//
					//	1.	Return differnce between current and recommended 
					//		invest to set the width.
					//
					return xBar(investment.current) - xBar(investment.recommended);
				}
				//
				//	2.	Check if differnce of current and recommended value is
				//		 less than or equal to 0.
				//
				if (xBar(investment.current) - xBar(investment.recommended) <= 0) 
				{
					//
					//	1.	Return differnce between current and recommended 
					//		invest to set the width	.
					//
					return (-1 * (xBar(investment.current) - 
					xBar(investment.recommended)));
				}

			})
			.attr("x", function (investment) {
			
				//		 
				//	1.	Check if current value is less than recommended value.
				//
				if (xBar(investment.current) < xBar(investment.recommended)) {
					//
					//	1.	Return addition value of left margin and 
					//		current value.
					//
					return margin.left + xBar(investment.current);
				}
				//
				//	2.	Check if current value is greater than and equal to
				//		recommended value.
				//
				if (xBar(investment.current) - xBar(investment.recommended) >= 0) {
					//
					//	1.	Return addition value of left margin and 
					//		recommended value.
					//
					return margin.left + xBar(investment.recommended);
				}

			})
			.attr("y", function (investment) {

				//
				//	1.	return value of 'y' attribute of element.
				//
				return yBar(investment.investType);

			})
			.attr("height", yBar.bandwidth())
			.on("mouseenter", function (investment) {

				//
				//	1.	Show detail in tooltip on mouse enter.
				//
				showDetail($.extend(true, {}, investment), d3.event,
				container_div);

			}).on("mousemove", function (investment) {

				//
				//	1.	Show detail in tooltip and move on mouse enter.
				//
				showDetail($.extend(true, {}, investment), d3.event,
				container_div);

			}).on("mouseout", function (investment) {

				//
				//	1.	Hide detail shown in tooltip.
				//
				hideTooltip();

			});
		
		//
		//  28.  Display recommended value on chart.
		//
		var text_recommended = rect_bar.enter().append("text")
			.attr("y", function (investment) {

				//
				//	1.	Subtracting 0.1 times width value of band from start
				//	     value of the corresponding band and returns the output.
				//
				return yBar(investment.investType) - (yBar.bandwidth() * 0.1);

			})
			.attr("current", function (investment) {

				//
				//	1.	Returns current invest value to display on chart.
				//
				return xBar(investment.current);

			})
			.attr("recommended", function (investment) {

				//
				//	1.	Returns recommended invest value to display on chart.
				//
				return xBar(investment.recommended);

			})
			.attr("x", function (investment) {

				//		 
				//	1.	Check if recommended value is greater than current
				//		value.
				//
				if (xBar(investment.recommended) > xBar(investment.current)) {
					//
					//	1.	Return calculated value thats assigns to x 
					//		attribute.
					//
					return margin.left + xBar(investment.current) +
					((xBar(investment.recommended) - xBar(investment.current)) / 2);
				}
				//
				//	2.	Check if recommended value is less than and and
				//		equal to current value.
				//
				if (xBar(investment.recommended) <= xBar(investment.current)) {
					//
					//	1.	Return calculated value thats assigns to x 
					//		attribute.
					//
					return margin.left + xBar(investment.recommended) + 
					((xBar(investment.current) - xBar(investment.recommended)) / 2);
				}


			})
			.style("font-size", font_style.barText.fontSize || "12px")
			.style("font-weight", font_style.barText.fontWeight || "bold")
			.style("fill", font_style.barText.fontColor || "#B3B3B3")
			.text(function (investment) {

				// 
				//	1.	Check If current value is not equal to recommended
				//		value.
				//
				if(investment.current != investment.recommended)
				{
					//
					//	1.	Returns recommended value with dollar sign
					//		to display on chart.
					//
					return "$" + investment.recommended;
				}

				//
				//	2.	Check If current value is equal to recommended value.
				//
				if(investment.current == investment.recommended)
				{
					//
					//	1.	Returns blank string not to display on chart. 
					//
					return "";
				}

			});
		
		//
		//  29.  Alignment/Position setup for recommended values on chart.
		//
		text_recommended.attr("x", function (investment) {

			//
			//	1.	Returns value of x attribute.
			//
			return parseFloat(d3.select(this).attr("x")) -
			(parseFloat(d3.select(this).node().getBBox().width) / 2);

		});

		//
		//  30.  Draw Red strip on bar to scale value(current/recommended).
		//
		//		CBT: for red rectangle
		//		s
		rect_bar.enter().append("rect")
			.attr("class", function (investment) {

				//
				//	1.	Retruns value of class to rect element.
				//
				return "reactRedBar";

			})
			.attr("opacity", 1)
			.attr("fill", function (investment) {

				//
				//	1.	check if current invested value is not equal to
				//		 recommended value.
				//
				if (investment.current != investment.recommended)
				{
					//
					//	1.	Returns color to fill.
					//
					return arrow_style.color;
				}

				//
				//	2.	check if current invested value is equal to
				//		 recommended value.
				//
				if (investment.current == investment.recommended)
				{
					//
					//	1.	Returns none not to fill.
					//
					return "none";
				}

			})
			.attr("cursor", "pointer")
			.attr("data", function (investment) {

				//
				//	1.	Returns investment data in string form.
				//
				return JSON.stringify(investment);

			})
			.attr("width", 4)
			.attr("x", function (investment) {

				//
				//	1.	Returns number to for attribute.
				//
				return margin.left + xBar(investment.recommended);

			})
			.attr("y", function (investment) {

				//
				//	1.	Returns the start value of the corresponding band.
				//
				return yBar(investment.investType);

			})
			.attr("height", yBar.bandwidth())
			.on("mouseenter", function (investment) {

				//
				//	1.	Show detail of measurement in tooltop on cursor entry.
				//
				showDetail($.extend(true, {}, investment), d3.event,
				container_div);

			}).on("mousemove", function (investment) {

				//
				//	1.	Show detail of measurement in tooltop on mouse move.
				//
				showDetail($.extend(true, {}, investment), d3.event,
				container_div);

			}).on("mouseout", function (investment) {

				//
				//	1.	Hide detail/tooltop on mouse out.
				//
				hideTooltip();

			});

		//
		//	31.	Creating a method to generate a line of difference in chart.
		//
		var line_generator = d3.line().curve(d3.curveCatmullRom);

		//
		//	CBT: for red arrow.
		//
		rect_bar.enter().append("path").attr('d', function (investment) {

				//
				//	1.	Check if current value is greater than recommended.
				//
				if (investment.current > investment.recommended)
				{
					//
					//	CBT: right arrow.
					//

					//
					//	1.	Width of xBar.
					//
					var total_width = xBar(investment.current) -
					xBar(investment.recommended) - 5;

					//
					//	2.	Start value to draw ybar  arrow.
					//
					var yStart = yBar(investment.investType);

					//
					//	3.	Start value to draw xbar  arrow.
					//
					var xStart = margin.left + xBar(investment.recommended);

					//
					//	4.	Height of  ybar.
					//
					var total_height = yBar.bandwidth();

					//
					//	5.	Maximum height calculated.
					//
					var maximum_height = total_height * 0.9;

					//
					//	6.	Minimum height calculated.
					//
					var minimum_height = total_height * 0.25;

					//
					//	7.	Calculating height of arrow according to bar's width.
					//		This height is of banded right arrow sign (>).
					//		The sign that indicates 'you needed less'.
					//
					var arro_height = (total_width * total_height) /
						maximum_distance;
					arro_height = (arro_height > maximum_height) ? maximum_height
						: (arro_height < minimum_height) ? minimum_height :arro_height;
					arro_height = arro_height / 2;
					
					//
					//	8.	Calculating width of arrow.
					//
					var arrow_bar_width = xStart + (total_width * 0.75);

					//
					//	9.	Calculating width of stroke.
					//
					var stroke_width = (arrow_style.strokeWidth / 2);

					//
					//	10.	Calculating array of x and y co-cordinations(positions)
					//		to draw right arrow that Indicates you need less.
					//
					var points = [
						[xStart, (yStart + (total_height / 2)) - stroke_width],
						[(xStart + total_width), (yStart + (total_height / 2)) -
						stroke_width],
						[arrow_bar_width, ((yStart + (total_height / 2)) -
						arro_height)],
						[(xStart + total_width), (yStart + (total_height / 2)) -
						stroke_width],
						[arrow_bar_width, ((yStart + (total_height / 2)) +
						arro_height)],
					];

					return line_generator(points);

				}

				//
				//	2.	Check if current value is lesser than recommended.
				//
				if (investment.current < investment.recommended)
				{
					//
					//	CBT: left arrow
					//

					//
					//	1.	Total Width of xBar.
					//
					var total_width = xBar(investment.recommended) -
					xBar(investment.current) - 5;

					//
					//	2.	Start value to draw ybar  arrow.
					//
					var yStart = yBar(investment.investType);

					//
					//	3.	Start value to draw xbar  arrow.
					//
					var xStart = margin.left + xBar(investment.recommended);

					//
					//	4.	Height of  ybar.
					//
					var total_height = yBar.bandwidth();

					//
					//	5.	Maximum height calculated.
					//
					var maximum_height = total_height * 0.9;

					//
					//	6.	Minimum height calculated.
					//
					var minimum_height = total_height * 0.25;

					//
					//	7.	Calculating height of arrow according to bar's width.
					//		This height is of banded right left sign (<).
					//		The sign that indicates 'you needed more'.
					//
					var arro_height = (total_width * total_height) /
					maximum_distance;
					arro_height = (arro_height > maximum_height) ? maximum_height :
					(arro_height < minimum_height) ? minimum_height : arro_height;
					arro_height = arro_height / 2;

					//
					//	8.	calculating width of arrow bar
					//
					var arrow_bar_width = xStart - (total_width * 0.75);


					var stroke_width = (arrow_style.strokeWidth / 2) + 1;
					//
					//	9.	Calculating array of x and y co-cordinations(positions)
					//		to draw left arrow that Indicates you need more.
					//
					var points = [
						[xStart, (yStart + (total_height / 2)) - stroke_width],
						[(xStart - total_width), (yStart + (total_height / 2)) -
						stroke_width],
						[arrow_bar_width, ((yStart + (total_height / 2)) -
						arro_height - stroke_width)],
						[(xStart - total_width), (yStart + (total_height / 2))
						- stroke_width],
						[arrow_bar_width, ((yStart + (total_height / 2)) +
						arro_height)],
					];
					return line_generator(points);
				}

			})
			.style("stroke", arrow_style.color)
			.style("fill", "none")
			.style("stroke-width", arrow_style.strokeWidth)
			.on("mouseenter", function (investment) {

				//
				//	1.	Show detail of measurement in tooltop on mouse enter.
				//
				showDetail($.extend(true, {}, investment), d3.event,
				container_div);

			}).on("mouseover", function (investment) {

				//
				//	1.	Show detail of measurement in tool-top on mouse over.
				//
				showDetail($.extend(true, {}, investment), d3.event,
				container_div);

			}).on("mouseout", function (investment) {

				//
				//	1.	Hide detail of measurement in tool-top on mouse out.
				//
				hideTooltip();

			});

		//
		//  32. Draw a scale navigator on x-axis.
		//
		svg_bar.append("g")
			.attr("class", "xAxis")
			.attr("transform", "translate(" + margin.left + "," + (height_bar)
			+ ")")
			.call(d3.axisBottom(xBar).tickFormat(function (investment) {

				//
				//	1.	Returns investment object having related properties.
				//
				return investment;

			}))
			.append("text")
			.attr("x", width_bar / 2)
			.attr("y", margin.bottom * 0.5)
			.attr("dx", "0.32em")
			.attr("fill", "#000")
			.attr("font-weight", "bold")
			.style("fill", font_style.xAxis.fontColor || "#B3B3B3")
			.attr("font-size", "15px")
			.attr("text-anchor", "start")
			.text("Blue is What you want");

		//
		//	33.	Set the font style of scale.
		//
		d3.selectAll(".xAxis .tick text")
			.style("fill", font_style.xAxis.fontColor || "#B3B3B3")
			.style("font-size", font_style.xAxis.fontSize || "12px");

		//
		//  34.	Display investment scale on y-axis for identifiaction.
		//
		var investment_element = svg_bar.append("g")
			.attr("class", "yAxis")
			.attr("transform", "translate(" + margin.left + ",0)")
			.call(d3.axisLeft(yBar));

		//
		//	35.	Set the font style  of investment scale.
		//
		investment_element.selectAll("text")
			.attr("transform", "rotate(0)")
			.attr("dx", ".5em")
			.style("font-size", font_style.yAxis.fontSize || "13px")
			.style("font-weight", font_style.yAxis.fontWeight || "bold");

		//
		//	36.	15Change the font color style  of investment scale.
		//
		d3.selectAll(".yAxis .tick text")
			.style("fill", font_style.yAxis.fontColor || "#B3B3B3")
			.style("font-size", font_style.yAxis.fontSize || "12px");

		//
		//	37.	Placing the investment scale.
		//
		//		CBT: this is to make label on yaxis on center
		//
		d3.selectAll(".yAxis .tick text").attr("y", function (investment) {

			//
			//	1.	Returns y-axis position to set label.
			//
			return d3.select(this).node().getBBox().y + (d3.select(this).node()
				.getBBox().height / 2);

		})

		//
		//	38.	Move to the next promise.
		//
		resolve();

	})
}

//
//  Show detail in tool-tip on mouse-enter / mouse-move / mouse-out.
//
function showDetail(investment, mouseEvent, containerDiv)
{

	//
	//	1.	Initialize content of tooltip.
	//
	var content = "";

	//
	//	2.	Font size of label inside tooltip
	//
	var label_fontSize = "16px";

	//
	//	3.	Font color of label inside tooltip
	//
	var label_font_color = "black";

	//
	//	4.	Font family of label inside tooltip
	//
	var label_font_family = "Bariol";

	//
	//	5.	Font size.
	//
	var value_font_size = "16px";

	//
	//	6.	Font color.
	//
	var value_font_color = "black";

	//
	//	7.	Font family.
	//
	var value_font_family = "Bariol-Bold";

	//
	//	8.	Delete color property inside investment.
	//
	delete investment.color;

	//
	//	9.	Contain the array of keys in a variable.
	//
	var tooltips_contents = Object.keys(investment);

	//
	//	10.	Create table appears inside tooltip to show investment detail.
	//
	tooltips_contents.map(function (data) {

		//
		//	1.	Create content of tooltip with css styling.
		//
		content =
			content +
		`<tr><td class="key" style="letter-spacing: 1.04px;line-height: 1.2;font-size:${label_fontSize};font-family:${label_font_family};color:${label_font_color}">${data} </td>
				<td class="value" style="letter-spacing: 1.04px;line-height: 1.2;font-size:${value_font_size};font-family:${value_font_family};color:${value_font_color}">${
			investment[data]
			}</td></tr>`;

	});

	//
	//	11.	Adding content into investment which is to be displayed inside tooltip.
	//
	investment["content"] = content;
	
	//
	//	12.	Adding x-axis position tooltip will be appeared at.
	//
	investment["x"] = d3.event.x;
	
	//
	//	14.	Adding y-axis position tooltip will be appeared at.
	//
	investment["y"] = d3.event.y;

	//
	//	15.	Adding id name of main div where tooltip will be appeared inside.
	//
	investment["mainDivId"] = containerDiv;

	//
	//	16.	Adding left margin value of tooltip.
	//
	investment["marginLeft"] = 0;

	//
	//	17.	Adding top margin value of tooltip.
	//
	investment["marginTop"] = 0;

	//
	//	18.	Calling function to show tooltip.
	//
	showTooltip([investment], d3.event, "tooltip_map");
}

//
//  To show the tool-tip of invest type scale line.
//
function showTooltip(arrObj, event, className)
{
	//
	//	Select multiple elements from the document and remove them.
	//
	d3.selectAll(".CBTTooltip").remove();

	//
	//	Select multiple elements from the document and remove them.
	//
	d3.selectAll(".CBTDataTip").remove();

	//
	//	Creating the content appears inside tooltip.
	//
	arrObj.map(function (obj, i) {
		var tooltipClass = "CBTTooltip";
		d3.select("body")
			.append("div")
			.attr("class", "tooltip " + tooltipClass + " tooltipCustomBarChart "
			+ (className ? className : ""))
			.attr("id", "CBTBarTooltip_" + i)
			.style("pointer-events", "none")
			.style("opacity", 1.0);

		//
		//	1.	Appending table in tool-tip.
		//
		$("#CBTBarTooltip_" + i).append("<table></table>");

		//
		//	2.	Appending data into table inside tool-tip.
		//
		$("#CBTBarTooltip_" + i + " table").append(obj.content);

		//
		//	3.	Setting the outer width of tool-tip
		//
		$("#CBTBarTooltip_" + i)
			.innerWidth($("#CBTBarTooltip_" + i + " table")
			.outerWidth());

		//
		//	4.	Append tooltip div and Assign it class,i d and opacity.
		//
		d3.select("body")
			.append("div")
			.attr("class", tooltipClass)
			.attr("id", "triangle_" + i)
			.style("opacity", 1.0);
	});

	//
	//	Update position of tool-tip.
	//
	updatePosition(arrObj, event);
}

//
//  Update position on mouse move
//
function updatePosition(arrObj, event)
{
	arrObj.map(function (obj, i) {

		//
		//	1.	Padding value
		//
		var yXtra = 20;

		//
		//	2.	Temporary Position on y-axis
		//
		var yAxis = obj.y;

		//
		//	3.	Temporary Position on x-axis
		//
		var xAxis = obj.x;

		//
		//	4.	Select multiple elements from the document.
		//
		var tooltip = d3.selectAll("#CBTBarTooltip_" + i);

		//
		//	5.	Select multiple elements from the document.
		//
		var triangle = d3.selectAll("#triangle_" + i);

		//
		//	6.	Main width of tooltip.
		//
		obj.mainDivWidth = obj.mainDivWidth || parseFloat(d3.select("#" +
		obj.mainDivId).attr("width"));

		//
		//	7.	Main height of div.
		//
		obj.mainDivHeight = obj.mainDivHeight || parseFloat(d3.select("#" +
		obj.mainDivId).attr("height"));
 
		//
		//	8.	Calculating Offset of div.
		//
		var top_offset = 0;
		var left_offset = 0;

		//
		//	Not being used.
		//
		// top_offset = $("#" + obj.mainDivId).offset().top;
		// left_offset = $("#" + obj.mainDivId).offset().left;
		// top_offset = top_offset + parseFloat(obj.marginTop);
		// left_offset = left_offset + parseFloat(obj.marginLeft);

		//
		//	9.	Actual Position of tool tip on y-axis.
		//
		var posY = yAxis - ($("#CBTBarTooltip_" + i).height() + yXtra);

		//
		//	10.	Actual Position of tool tip on x-axis.
		//
		var posX = xAxis - $("#CBTBarTooltip_" + i).width() / 2;

		//
		//	11.	Styling triangle to navigate cursor position.
		//
		triangle.attr("style", "");
		var triangle_top = 0;
		var triangle_left = 0;

		//
		//	12.	Set the style of triangle shaped navigator of tooltip.
		//
		triangle
			.style("border-top", "10px solid #ccc")
			.style("border-left", "15px solid transparent")
			.style("position", "fixed")
			.style("border-right", "15px solid transparent");
		triangle_top = yAxis - 20;
		triangle_left = xAxis - 10;

		//
		//	13.	Set the position of tooltip.
		//
		tooltip.style("top", `${posY}px`).style("left", `${posX}px`);

		//
		//	14.	Set the position of trinagle shaped navigator of tooltip.
		//
		triangle.style("top", `${triangle_top}px`)
			.style("left", `${triangle_left}px`);

	});
}

//
//  Hide tool-tip.
//
function hideDetail(param)
{
	//
	//	1.	Call function to hide tooltip.
	//
	hideTooltip();
}

//
//	Function to hide tool-tip.
//
function hideTooltip()
{
	//
	//	1.	Remove element 'tooltip'.
	//
	d3.selectAll(".CBTTooltip ").remove();
}

//
//	For investment 
//


function drawStackChartInvestment(chartConfig) {
	var svgBar = d3.select("." + chartConfig.svgClass),
		margin = chartConfig.margin,
		widthBar = +svgBar.attr("width"),
		heightBar = +svgBar.attr("height");
	heightBar = heightBar - (margin.top + margin.bottom);
	widthBar = widthBar - margin.left - margin.right;
	var data = chartConfig.data;
	var containerDiv = chartConfig.containerDiv;
	var fontStyle = chartConfig.fontStyle;
	var arrowStyle = chartConfig.arrowStyle;
	var labelPrefix = fontStyle.barText.labelPrefix || '';
	var yAxisLabelText = chartConfig.label.yAxis || '';
	//CBT:set Invert type if not provided
	var data = Object.keys(data).map(function (d) {
		data[d]["investType"] = d;
		return data[d];
	});

	//CBT:sort data on descending order of "order" provided in chartdata    
	data = data.sort(function (a, b) {
		return b.order - a.order;
	});

	var xBar = d3.scaleBand()
		.rangeRound([0, widthBar])
		.padding(0.3);

	xBar.domain(data.map(function (d) {
		return d.investType
	}));

	var yBar = d3.scaleLinear()
		.rangeRound([heightBar, 0]);

	var maxY = d3.max([d3.max(Object.keys(data).map(function (d) {
		return data[d].current
	})), d3.max(Object.keys(data).map(function (d) {
		return data[d].recommended
	}))]);

	var minY = d3.min([d3.min(Object.keys(data).map(function (d) {
		return data[d].current
	})), d3.min(Object.keys(data).map(function (d) {
		return data[d].recommended
	}))]);
	yBar.domain([(minY - 1000) > 0 ? (minY - 1000) : 0, maxY]);

	var maximumDistance = d3.max(data, function (d) {
		return d.current > d.recommended ? (yBar(d.recommended) - yBar(d.current)) : (yBar(d.current) - yBar(d.recommended));
	});

	svgBar.append("g")
		.attr("class", "barRect")
		.attr("transform", "translate(0," + margin.top + ")");
	var gBar = d3.selectAll(".barRect");


	var rectBar = gBar.selectAll("rect")
		.data(data);

	//CBT:Main bar based on current investment data start:
	rectBar.enter().append("rect")
		.attr("class", function (d) {
			return "reactBar";
		})
		.attr("opacity", 0.9)
		.attr("fill", function (d) {
			return d.color;
		})
		.attr("cursor", "pointer")
		.attr("data", function (d) {
			return JSON.stringify(d);
		})
		.attr("width", xBar.bandwidth())
		.attr("x", function (d) {
			return margin.left + xBar(d.investType);
		})
		.attr("y", function (d) {
			return yBar(d.current);
		})
		.attr("height", function (d) {
			return heightBar - yBar(d.current);
		})
		.on("mouseenter", function (d) {
			d3.select(this).style("opacity", 1);
			showDetail([$.extend(true, {}, d)], d3.event, containerDiv);
		}).on("mousemove", function (d) {
			d3.select(this).style("opacity", 1);
			showDetail([$.extend(true, {}, d)], d3.event, containerDiv);
		}).on("mouseout", function (d) {
			d3.select(this).style("opacity", 0.9);
			hideTooltip();
		});
	//CBT:Main bar based on current investment data end:

	//CBT:text on left side of bar based on current investment start: 
	var textCurrent = rectBar.enter().append("text")
		.attr("y", function (d) {
			return (margin.left + xBar(d.investType)) - 3;
		})
		.attr("x", function (d) {
			return -(yBar(d.current) + ((heightBar - yBar(d.current)) / 2))
		})
		.attr("transform", "rotate(270)")
		.attr("text-anchor", "middle")
		.style("font-size", fontStyle.barText.fontSize || "12px")
		.style("font-weight", fontStyle.barText.fontWeight || "bold")
		.style("fill", fontStyle.barText.fontColor || "#B3B3B3")
		.text(function (d) {
			return labelPrefix + d.current;
		});
	//CBT:text on left side of bar based on current investment end:

	//CBT:For black border of bar when current investment is not equal to recommended investment start:
	rectBar.enter().append("rect")
		.attr("class", function (d) {
			return "reactBlackBorderBar";
		})
		.attr("opacity", 1)
		.attr("fill", function (d) {
			return "transparent";
		})
		.attr("stroke-opacity", 1)
		.attr("stroke-width", "0.5px")
		.attr("stroke", function (d) {
			if (d.current != d.recommended) {
				return "black";
			} else {
				return "none";
			}
		})
		.attr("width", xBar.bandwidth())
		.attr("x", function (d) {
			return margin.left + xBar(d.investType);
		})
		.attr("y", function (d) {
			return (yBar(d.current) < yBar(d.recommended) ? yBar(d.current) : yBar(d.recommended));
		})
		.attr("height", function (d) {
			return yBar(d.current) < yBar(d.recommended) ? (yBar(d.recommended) - yBar(d.current)) : (yBar(d.current) - yBar(d.recommended));
		})
		.on("mouseenter", function (d) {
			showDetail([$.extend(true, {}, d)], d3.event, containerDiv);
		}).on("mousemove", function (d) {
			showDetail([$.extend(true, {}, d)], d3.event, containerDiv);
		}).on("mouseout", function (d) {
			hideTooltip();
		});
	//CBT:For black border of bar when current investment is not equal to recommended investment end:

	//CBT:text on left side of bar based on recommended investment start: 
	var textRecommended = rectBar.enter().append("text")
		.attr("y", function (d) {
			return (margin.left + xBar(d.investType)) - 3;
		})
		.attr("transform", "rotate(270)")
		.attr("text-anchor", "middle")
		.attr("x", function (d) {
			return (yBar(d.current) < yBar(d.recommended)) ? 0 - ((yBar(d.current) + yBar(d.recommended)) / 2) : 0 - ((yBar(d.recommended) + yBar(d.current)) / 2);
		})
		.style("font-size", fontStyle.barText.fontSize || "12px")
		.style("font-weight", fontStyle.barText.fontWeight || "bold")
		.style("fill", fontStyle.barText.fontColor || "#B3B3B3")
		.text(function (d) {
			if (d.current != d.recommended)
				return labelPrefix + d.recommended;
			else
				return "";
		});
	//CBT:text on left side of bar based on recommended investment end: 

	//CBT:This is for red rectangle line for current and recommended investment not same : start :
	rectBar.enter().append("rect")
		.attr("class", function (d) {
			return "reactRedBar";
		})
		.attr("opacity", 1)
		.attr("fill", function (d) {
			if (d.current != d.recommended) {
				return arrowStyle.color;
			} else {
				return "none";
			}
		})
		.attr("cursor", "pointer")
		.attr("width", xBar.bandwidth())
		.attr("x", function (d) {
			return margin.left + xBar(d.investType);
		})
		.attr("y", function (d) {
			return yBar(d.recommended);
		})
		.attr("height", 4)
		.on("mouseenter", function (d) {
			showDetail([$.extend(true, {}, d)], d3.event, containerDiv);
		}).on("mousemove", function (d) {
			showDetail([$.extend(true, {}, d)], d3.event, containerDiv);
		}).on("mouseout", function (d) {
			hideTooltip();
		});
	//CBT:This is for red rectangle line for current and recommended investment not same : end :

	//CBT:line generator for red arrow
	var lineGenerator = d3.line()
		.curve(d3.curveCatmullRom);


	//CBT:Arrow logic :start:
	rectBar.enter().append("path")
		.attr('d', function (d) {
			var totalWidth = xBar.bandwidth(); //xBar(d.current)-xBar(d.recommended)-5;
			var yStart = yBar(d.current);
			var xStart = margin.left + xBar(d.investType);
			var totalHeight = yBar(d.recommended) - yBar(d.current) - 5;
			var maximumWidth = totalWidth * 0.65;
			var minimumWidth = totalWidth * 0.25;

			var arroWidth = (totalWidth * totalHeight) / maximumDistance;
			arroWidth = (arroWidth > maximumWidth) ? maximumWidth : (arroWidth < minimumWidth) ? minimumWidth : arroWidth;
			arroWidth = arroWidth * 0.3;
			var arrowBarHeight = yStart + (totalHeight * 0.6);
			var strokeWidth = (arrowStyle.strokeWidth / 2);
			if (d.current > d.recommended) {
				//CBT:down arrow
				var points = [
					[(xStart + (totalWidth / 2)) - strokeWidth, yStart],
					[(xStart + (totalWidth / 2)) - strokeWidth, (yStart + totalHeight)],
					[((xStart + (totalWidth / 2)) - arroWidth), arrowBarHeight],
					[(xStart + (totalWidth / 2)) - strokeWidth, (yStart + totalHeight)],
					[((xStart + (totalWidth / 2)) + arroWidth), arrowBarHeight]
				];

				return lineGenerator(points);
			} else if (d.current < d.recommended) {
				//CBT:up arrow
				totalHeight = yBar(d.current) - yBar(d.recommended) - 5;
				arroWidth = (totalWidth * totalHeight) / maximumDistance;
				arroWidth = (arroWidth > maximumWidth) ? maximumWidth : (arroWidth < minimumWidth) ? minimumWidth : arroWidth;
				arroWidth = arroWidth * 0.3;
				arrowBarHeight = yStart - (totalHeight * 0.6);
				var points = [
					[(xStart + (totalWidth / 2)) - strokeWidth, yStart],
					[(xStart + (totalWidth / 2)) - strokeWidth, (yStart - totalHeight)],
					[((xStart + (totalWidth / 2)) - arroWidth), arrowBarHeight],
					[(xStart + (totalWidth / 2)) - strokeWidth, (yStart - totalHeight)],
					[((xStart + (totalWidth / 2)) + arroWidth), arrowBarHeight],
				];

				return lineGenerator(points);
			}
		})
		.style("stroke", arrowStyle.color)
		.style("fill", "none")
		.style("stroke-width", arrowStyle.strokeWidth)
		.on("mouseenter", function (d) {
			showDetail([$.extend(true, {}, d)], d3.event, containerDiv);
		}).on("mouseover", function (d) {
			showDetail([$.extend(true, {}, d)], d3.event, containerDiv);
		}).on("mouseout", function (d) {
			hideTooltip();
		});

	//CBT:Arrow logic :end:

	var yAxis = svgBar.append("g")
		.attr("class", "yAxis")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.call(d3.axisLeft(yBar).tickFormat(function (d) {
			return (fontStyle.yAxis.labelPrefix || '') + d;
		}));

	yAxis.selectAll("text")
		.attr("transform", "rotate(0)")
		.attr("dx", ".5em")
		// .attr("dy", "-.9em")
		.style("font-size", fontStyle.yAxis.fontSize || "13px")
		.style("font-weight", fontStyle.yAxis.fontWeight || "");

	d3.selectAll(".yAxis .tick text")
		.style("fill", fontStyle.yAxis.fontColor || "#B3B3B3")
		.style("font-size", fontStyle.yAxis.fontSize || "12px");


	var yAxisLabel = yAxis.append("text")
		.attr("x", 0 - (heightBar / 2))
		.attr("y", (margin.left * 0.25) - margin.left)
		// .attr("dx", "0.32em")
		.attr("transform", "rotate(270)")
		.attr("fill", "#000")
		.attr("font-weight", fontStyle.yAxisLabel.fontWeight || "bold")
		.style("fill", fontStyle.yAxisLabel.fontColor || "#B3B3B3")
		.attr("font-size", fontStyle.yAxisLabel.fontSize || "15px")
		.attr("text-anchor", "middle")
		.text(yAxisLabelText);

	var xAxis = svgBar.append("g")
		.attr("class", "xAxis")
		.attr("transform", "translate(" + margin.left + "," + (heightBar + margin.top) + ")")
		.call(d3.axisBottom(xBar));

	d3.selectAll(".xAxis .tick text")
		.style("fill", fontStyle.xAxis.fontColor || "#B3B3B3")
		.style("font-size", fontStyle.xAxis.fontSize || "12px")
		.style("font-weight", fontStyle.xAxis.fontWeight || "");;

}
function showDetail(d, mouseEvent, containerDiv) {
	d = d[0];
	var content = "";
	var labelFontSize = "16px";
	var labelFontColor = "black";
	var labelFontFamily = "Bariol";
	var valueFontSize = "16px";
	var valueFontColor = "black";
	var valueFontFamily = "Bariol-Bold";
	delete d.color;
	var tooltipsContents = Object.keys(d);
	tooltipsContents.map(function (data) {
		content =
			content +
			`<tr><td class="key" style="letter-spacing: 1.04px;line-height: 1.2;font-size:${labelFontSize};font-family:${labelFontFamily};color:${labelFontColor}">${data} </td>
                <td class="value" style="letter-spacing: 1.04px;line-height: 1.2;font-size:${valueFontSize};font-family:${valueFontFamily};color:${valueFontColor}">${
			d[data]
			}</td></tr>`;
	});

	d["content"] = content;
	d["x"] = d3.event.x;
	d["y"] = d3.event.y;
	d["mainDivId"] = containerDiv;
	d["marginLeft"] = 0;
	d["marginTop"] = 0;
	showTooltip([d], d3.event, "tooltip_map");
}


function showTooltip(arrObj, event, className) {
	d3.selectAll(".CBTTooltip").remove();
	d3.selectAll(".CBTDataTip").remove();

	arrObj.map(function (obj, i) {
		var tooltipClass = "CBTTooltip";
		d3
			.select("body")
			.append("div")
			.attr("class", "tooltip " + tooltipClass + " tooltipCustomBarChart " + (className ? className : ""))
			.attr("id", "CBTBarTooltip_" + i)
			.style("pointer-events", "none")
			.style("opacity", 1.0);

		$("#CBTBarTooltip_" + i).append("<table></table>");

		$("#CBTBarTooltip_" + i + " table").append(obj.content);
		// .html(obj.content);
		$("#CBTBarTooltip_" + i).innerWidth($("#CBTBarTooltip_" + i + " table").outerWidth());

		d3
			.select("body")
			.append("div")
			.attr("class", tooltipClass)
			.attr("id", "triangle_" + i)
			.style("opacity", 1.0);
	});

	updatePosition(arrObj, event);
}

function updatePosition(arrObj, event) {

	arrObj.map(function (obj, i) {
		var xXtra = 0; //20 for padding
		var yXtra = 20; //20 for padding
		var y = obj.y;
		var x = obj.x;
		var tt = d3.selectAll("#CBTBarTooltip_" + i);
		var triangle = d3.selectAll("#triangle_" + i);
		var height = $("#CBTBarTooltip_" + i).height();
		var width = $("#CBTBarTooltip_" + i).width();
		obj.mainDivWidth = obj.mainDivWidth || parseFloat(d3.select("#" + obj.mainDivId).attr("width"));
		obj.mainDivHeight = obj.mainDivHeight || parseFloat(d3.select("#" + obj.mainDivId).attr("height"));
		var topOffset = 0;
		var leftOffset = 0;
		var topMinimum = 0;
		var leftMinimum = 0;
		topOffset = $("#" + obj.mainDivId).offset().top;
		leftOffset = $("#" + obj.mainDivId).offset().left;

		topOffset = topOffset + parseFloat(obj.marginTop);
		leftOffset = leftOffset + parseFloat(obj.marginLeft);
		var posY = obj.y - ($("#CBTBarTooltip_" + i).height() + yXtra);
		var posX = obj.x - $("#CBTBarTooltip_" + i).width() / 2;



		triangle.attr("style", "");
		var triangleTop = 0;
		var triangleLeft = 0;
		triangle
			.style("border-top", "10px solid #ccc")
			.style("border-left", "15px solid transparent")
			.style("position", "fixed")
			.style("border-right", "15px solid transparent");
		triangleTop = obj.y - 20;
		triangleLeft = obj.x - 10;

		tt.style("top", `${posY}px`).style("left", `${posX}px`);
		triangle.style("top", `${triangleTop}px`).style("left", `${triangleLeft}px`);
	});

}

function hideDetail(d) {
	hideTooltip();
}
function hideTooltip() {
	d3.selectAll(".CBTTooltip ").remove();
}




//
//	For months
//

function drawStackChartMonths(chartConfig) {
	var svgBar = d3.select("." + chartConfig.svgClass),
		margin = chartConfig.margin,
		widthBar = +svgBar.attr("width"),
		heightBar = +svgBar.attr("height");
	heightBar = heightBar - (margin.top + margin.bottom);
	widthBar = widthBar - margin.left - margin.right;
	var data = chartConfig.data;
	var containerDiv = chartConfig.containerDiv;
	var fontStyle = chartConfig.fontStyle;
	var arrowStyle = chartConfig.arrowStyle;
	var labelPrefix = fontStyle.barText.labelPrefix || '';
	var xAxisLabelText = chartConfig.label.xAxis || '';

	var data = Object.keys(data).map(function (d) {
		data[d]["investType"] = d;
		return data[d];
	});
	data = data.sort(function (a, b) {
		return a.order - b.order;
	});

	var yBar = d3.scaleBand()
		.rangeRound([heightBar, 0])
		.padding(0.3);

	yBar.domain(data.map(function (d) {
		return d.investType
	}));

	var xBar = d3.scaleLinear()
		.rangeRound([0, widthBar]);



	var maxX = d3.max([d3.max(Object.keys(data).map(function (d) {
		return data[d].current
	})), d3.max(Object.keys(data).map(function (d) {
		return data[d].recommended
	}))]);

	var minX = d3.min([d3.min(Object.keys(data).map(function (d) {
		return data[d].current
	})), d3.min(Object.keys(data).map(function (d) {
		return data[d].recommended
	}))]);
	xBar.domain([(minX - 1000) > 0 ? (minX - 1000) : 0, maxX]);

	// var z =d3.scaleOrdinal(["#346CB0","#1fe8ef","#12edc5"]);
	// var z =d3.scaleOrdinal(["#5f4b8b"]);
	var maximumDistance = d3.max(data, function (d) {
		return d.current > d.recommended ? (xBar(d.current) - xBar(d.recommended)) : (xBar(d.recommended) - xBar(d.current));
	});

	svgBar.append("g")
		.attr("class", "barRect")
		.attr("transform", "translate(0," + margin.top + ")");
	var gBar = d3.selectAll(".barRect");


	var rectBar = gBar.selectAll("rect")
		.data(data);

	//CBT:this is for main bar
	rectBar.enter().append("rect")
		.attr("class", function (d) {
			return "reactBar";
		})
		.attr("opacity", 0.9)
		.attr("fill", function (d) {
			return d.color;
		})
		.attr("cursor", "pointer")
		.attr("data", function (d) {
			return JSON.stringify(d);
		})
		// .attr("stroke-opacity", 1)
		// .attr("stroke-width",function(d){
		//     if(d.current==d.recommended){
		//         return "3px";
		//     }else{
		//         return "0px";
		//     }
		// })
		// .attr("stroke",function(d){
		//     if(d.current==d.recommended){
		//         return "orange";
		//     }else{
		//         return "transparent";
		//     }
		// })
		.attr("width", function (d) {
			return xBar(d.current)
		})
		.attr("x", function (d) {
			return margin.left;
		})
		.attr("y", function (d) {
			return yBar(d.investType)
		})
		.attr("height", yBar.bandwidth())
		.on("mouseenter", function (d) {
			d3.select(this).style("opacity", 1);
			showDetail([$.extend(true, {}, d)], d3.event, containerDiv);
		}).on("mousemove", function (d) {
			d3.select(this).style("opacity", 1);
			showDetail([$.extend(true, {}, d)], d3.event, containerDiv);
		}).on("mouseout", function (d) {
			d3.select(this).style("opacity", 0.9);
			hideTooltip();
		});

	var textCurrent = rectBar.enter().append("text")
		.attr("y", function (d) {
			return yBar(d.investType) - (yBar.bandwidth() * 0.1);
		})
		.attr("x", function (d) {
			return margin.left + (xBar(d.current) / 2);
		})
		.style("font-size", fontStyle.barText.fontSize || "12px")
		.style("font-weight", fontStyle.barText.fontWeight || "bold")
		.style("fill", fontStyle.barText.fontColor || "#B3B3B3")
		.text(function (d) {
			return labelPrefix + d.current;
		});

	textCurrent.attr("x", function (d) {
		return parseFloat(d3.select(this).attr("x")) - (parseFloat(d3.select(this).node().getBBox().width) / 2)
	});

	//CBT:for  rectangle with black Border
	rectBar.enter().append("rect")
		.attr("class", function (d) {
			return "reactBlackBorderBar";
		})
		.attr("opacity", 1)
		.attr("fill", function (d) {
			return "transparent";
		})
		.attr("stroke-opacity", 1)
		.attr("stroke-width", "0.5px")
		.attr("stroke", function (d) {
			if (d.current != d.recommended) {
				return "black";
			} else {
				return "none";
			}
		})
		.attr("width", function (d) {
			return xBar(d.current) - xBar(d.recommended) > 0 ? xBar(d.current) - xBar(d.recommended) : (-1 * (xBar(d.current) - xBar(d.recommended)))
		})
		.attr("x", function (d) {
			return margin.left + (xBar(d.current) < xBar(d.recommended) ? xBar(d.current) : xBar(d.recommended));
		})
		.attr("y", function (d) {
			return yBar(d.investType)
		})
		.attr("height", yBar.bandwidth())
		.on("mouseenter", function (d) {
			showDetail([$.extend(true, {}, d)], d3.event, containerDiv);
		}).on("mousemove", function (d) {
			showDetail([$.extend(true, {}, d)], d3.event, containerDiv);
		}).on("mouseout", function (d) {
			hideTooltip();
		});

	var textRecommended = rectBar.enter().append("text")
		.attr("y", function (d) {
			return yBar(d.investType) - (yBar.bandwidth() * 0.1);
		})
		.attr("current", function (d) {
			return xBar(d.current)
		})
		.attr("recommended", function (d) {
			return xBar(d.recommended)
		})
		.attr("x", function (d) {
			return margin.left + (xBar(d.recommended) > xBar(d.current) ? xBar(d.current) + ((xBar(d.recommended) - xBar(d.current)) / 2) : xBar(d.recommended) + ((xBar(d.current) - xBar(d.recommended)) / 2));
		})
		.style("font-size", fontStyle.barText.fontSize || "12px")
		.style("font-weight", fontStyle.barText.fontWeight || "bold")
		.style("fill", fontStyle.barText.fontColor || "#B3B3B3")
		.text(function (d) {
			if (d.current != d.recommended)
				return labelPrefix + d.recommended;
			else
				return "";
		});

	textRecommended.attr("x", function (d) {
		return parseFloat(d3.select(this).attr("x")) - (parseFloat(d3.select(this).node().getBBox().width) / 2)
	});


	//CBT:for red rectangle
	rectBar.enter().append("rect")
		.attr("class", function (d) {
			return "reactRedBar";
		})
		.attr("opacity", 1)
		.attr("fill", function (d) {
			if (d.current != d.recommended) {
				return arrowStyle.color;
			} else {
				return "none";
			}
		})
		.attr("cursor", "pointer")
		.attr("data", function (d) {
			return JSON.stringify(d);
		})
		// .attr("stroke-opacity", 1)
		// .attr("stroke-width","1px")
		// .attr("stroke",function(d){
		//     if(d.current!=d.recommended){
		//         return "red";
		//     }else{
		//         return "none";
		//     }
		// })
		.attr("width", 4)
		.attr("x", function (d) {
			return margin.left + xBar(d.recommended);
		})
		.attr("y", function (d) {
			return yBar(d.investType)
		})
		.attr("height", yBar.bandwidth())
		.on("mouseenter", function (d) {
			showDetail([$.extend(true, {}, d)], d3.event, containerDiv);
		}).on("mousemove", function (d) {
			showDetail([$.extend(true, {}, d)], d3.event, containerDiv);
		}).on("mouseout", function (d) {
			hideTooltip();
		});

	var lineGenerator = d3.line()
		// .curve(d3.curveCardinal);
		.curve(d3.curveCatmullRom);
	//CBT:for red arrow
	rectBar.enter().append("path")
		.attr('d', function (d) {
			if (d.current > d.recommended) {
				//CBT:left arrow
				var totalWidth = xBar(d.current) - xBar(d.recommended) - 5;
				var yStart = yBar(d.investType);
				var xStart = margin.left + xBar(d.current);
				var totalHeight = yBar.bandwidth();
				var maximumHeight = totalHeight * 0.9;
				var minimumHeight = totalHeight * 0.25;

				var arroHeight = (totalWidth * totalHeight) / maximumDistance;
				arroHeight = (arroHeight > maximumHeight) ? maximumHeight : (arroHeight < minimumHeight) ? minimumHeight : arroHeight;
				arroHeight = arroHeight / 2;
				var arrowUpHeight = (totalHeight) * 0.4;
				var arrowDownHeight = (totalHeight) * 0.6;
				var arrowBarWidth = xStart - (totalWidth * 0.75);

				var strokeWidth = (arrowStyle.strokeWidth / 2);
				var points = [
					[xStart, (yStart + (totalHeight / 2)) - strokeWidth],
					[(xStart - totalWidth), (yStart + (totalHeight / 2)) - strokeWidth],
					[arrowBarWidth, ((yStart + (totalHeight / 2)) - arroHeight)],
					[(xStart - totalWidth), (yStart + (totalHeight / 2)) - strokeWidth],
					[arrowBarWidth, ((yStart + (totalHeight / 2)) + arroHeight)],
				];

				return lineGenerator(points);
			} else if (d.current < d.recommended) {
				var totalWidth = xBar(d.recommended) - xBar(d.current) - 5;
				var yStart = yBar(d.investType);
				var xStart = margin.left + xBar(d.current);
				var totalHeight = yBar.bandwidth();
				var maximumHeight = totalHeight * 0.9;
				var minimumHeight = totalHeight * 0.25;

				var arroHeight = (totalWidth * totalHeight) / maximumDistance;
				arroHeight = (arroHeight > maximumHeight) ? maximumHeight : (arroHeight < minimumHeight) ? minimumHeight : arroHeight;
				arroHeight = arroHeight / 2;
				var arrowUpHeight = (totalHeight) * 0.4;
				var arrowDownHeight = (totalHeight) * 0.6;
				var arrowBarWidth = xStart + (totalWidth * 0.75);

				var strokeWidth = (arrowStyle.strokeWidth / 2);
				var points = [
					[xStart, (yStart + (totalHeight / 2)) - strokeWidth],
					[(xStart + totalWidth), (yStart + (totalHeight / 2)) - strokeWidth],
					[arrowBarWidth, ((yStart + (totalHeight / 2)) - arroHeight)],
					[(xStart + totalWidth), (yStart + (totalHeight / 2)) - strokeWidth],
					[arrowBarWidth, ((yStart + (totalHeight / 2)) + arroHeight)],
				];

				return lineGenerator(points);
			}
		})
		.style("stroke", arrowStyle.color)
		.style("fill", "none")
		.style("stroke-width", arrowStyle.strokeWidth)
		.on("mouseenter", function (d) {
			showDetail([$.extend(true, {}, d)], d3.event, containerDiv);
		}).on("mouseover", function (d) {
			showDetail([$.extend(true, {}, d)], d3.event, containerDiv);
		}).on("mouseout", function (d) {
			hideTooltip();
		});


	var xAxis = svgBar.append("g")
		.attr("class", "xAxis")
		.attr("transform", "translate(" + margin.left + "," + (heightBar + margin.top) + ")")
		.call(d3.axisBottom(xBar).tickFormat(function (d) {
			return d
		}));

	var xAxisLabel = xAxis.append("text")
		.attr("x", widthBar / 2)
		.attr("y", margin.bottom * .75)
		.attr("dx", "0.32em")
		.attr("fill", "#000")
		.attr("font-weight", "bold")
		.style("fill", fontStyle.xAxis.fontColor || "#B3B3B3")
		.attr("font-size", "15px")
		.attr("text-anchor", "start")
		.text(xAxisLabelText);

	xAxisLabel.attr("x", parseFloat(xAxisLabel.attr("x")) - (xAxisLabel.node().getBBox().width / 2))

	debugger;

	d3.selectAll(".xAxis .tick text")
		.style("fill", fontStyle.xAxis.fontColor || "#B3B3B3")
		.style("font-size", fontStyle.xAxis.fontSize || "12px");



	var ele = svgBar.append("g")
		.attr("class", "yAxis")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.call(d3.axisLeft(yBar));

	ele.selectAll("text")
		.attr("transform", "rotate(0)")
		.attr("dx", ".5em")
		// .attr("dy", "-.9em")
		.style("font-size", fontStyle.yAxis.fontSize || "13px")
		.style("font-weight", fontStyle.yAxis.fontWeight || "bold");

	d3.selectAll(".yAxis .tick text")
		.style("fill", fontStyle.yAxis.fontColor || "#B3B3B3")
		.style("font-size", fontStyle.yAxis.fontSize || "12px");

	//CBT:this is to make label on yaxis on center
	d3.selectAll(".yAxis .tick text").attr("y", function (d) {
		return d3.select(this).node().getBBox().y + (d3.select(this).node().getBBox().height / 2);
	})
}
function showDetail(d, mouseEvent, containerDiv) {
	d = d[0];
	var content = "";
	var labelFontSize = "16px";
	var labelFontColor = "black";
	var labelFontFamily = "Bariol";
	var valueFontSize = "16px";
	var valueFontColor = "black";
	var valueFontFamily = "Bariol-Bold";
	delete d.color;
	var tooltipsContents = Object.keys(d);
	tooltipsContents.map(function (data) {
		content =
			content +
			`<tr><td class="key" style="letter-spacing: 1.04px;line-height: 1.2;font-size:${labelFontSize};font-family:${labelFontFamily};color:${labelFontColor}">${data} </td>
                <td class="value" style="letter-spacing: 1.04px;line-height: 1.2;font-size:${valueFontSize};font-family:${valueFontFamily};color:${valueFontColor}">${
			d[data]
			}</td></tr>`;
	});

	d["content"] = content;
	d["x"] = d3.event.x;
	d["y"] = d3.event.y;
	d["mainDivId"] = containerDiv;
	d["marginLeft"] = 0;
	d["marginTop"] = 0;
	showTooltip([d], d3.event, "tooltip_map");
}


function showTooltip(arrObj, event, className) {
	d3.selectAll(".CBTTooltip").remove();
	d3.selectAll(".CBTDataTip").remove();

	arrObj.map(function (obj, i) {
		var tooltipClass = "CBTTooltip";
		d3
			.select("body")
			.append("div")
			.attr("class", "tooltip " + tooltipClass + " tooltipCustomBarChart " + (className ? className : ""))
			.attr("id", "CBTBarTooltip_" + i)
			.style("pointer-events", "none")
			.style("opacity", 1.0);

		$("#CBTBarTooltip_" + i).append("<table></table>");

		$("#CBTBarTooltip_" + i + " table").append(obj.content);
		// .html(obj.content);
		$("#CBTBarTooltip_" + i).innerWidth($("#CBTBarTooltip_" + i + " table").outerWidth());

		d3
			.select("body")
			.append("div")
			.attr("class", tooltipClass)
			.attr("id", "triangle_" + i)
			.style("opacity", 1.0);
	});

	updatePosition(arrObj, event);
}

function updatePosition(arrObj, event) {

	arrObj.map(function (obj, i) {
		var xXtra = 0; //20 for padding
		var yXtra = 20; //20 for padding
		var y = obj.y;
		var x = obj.x;
		var tt = d3.selectAll("#CBTBarTooltip_" + i);
		var triangle = d3.selectAll("#triangle_" + i);
		var height = $("#CBTBarTooltip_" + i).height();
		var width = $("#CBTBarTooltip_" + i).width();
		obj.mainDivWidth = obj.mainDivWidth || parseFloat(d3.select("#" + obj.mainDivId).attr("width"));
		obj.mainDivHeight = obj.mainDivHeight || parseFloat(d3.select("#" + obj.mainDivId).attr("height"));
		var topOffset = 0;
		var leftOffset = 0;
		var topMinimum = 0;
		var leftMinimum = 0;
		topOffset = $("#" + obj.mainDivId).offset().top;
		leftOffset = $("#" + obj.mainDivId).offset().left;

		topOffset = topOffset + parseFloat(obj.marginTop);
		leftOffset = leftOffset + parseFloat(obj.marginLeft);
		var posY = obj.y - ($("#CBTBarTooltip_" + i).height() + yXtra);
		var posX = obj.x - $("#CBTBarTooltip_" + i).width() / 2;



		triangle.attr("style", "");
		var triangleTop = 0;
		var triangleLeft = 0;
		triangle
			.style("border-top", "10px solid #ccc")
			.style("border-left", "15px solid transparent")
			.style("position", "fixed")
			.style("border-right", "15px solid transparent");
		triangleTop = obj.y - 20;
		triangleLeft = obj.x - 10;

		tt.style("top", `${posY}px`).style("left", `${posX}px`);
		triangle.style("top", `${triangleTop}px`).style("left", `${triangleLeft}px`);
	});

}

function hideDetail(d) {
	hideTooltip();
}
function hideTooltip() {
	d3.selectAll(".CBTTooltip ").remove();
}