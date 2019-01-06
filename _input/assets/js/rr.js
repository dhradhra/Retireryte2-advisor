//
//	Get complete URL with no protocol
//
var url = window.location.hostname;

//
//	Get the base domain
//
var base_domain = psl.parse(url);

//
//	Set the region in which to operate.
//
AWS.config.region = 'us-east-1';

//
//	Create he user Cognito User Pool object so we can query this service.
//
var userPool = new AmazonCognitoIdentity.CognitoUserPool({
	UserPoolId : 'us-east-1_1qg7uCcA9',
	ClientId : '563mr6cn591t1nficb4hobdkth',
	Storage: new AmazonCognitoIdentity.CookieStorage({
		domain: "." + base_domain.domain
	})
});

//
//	Get the current loged-in user.
//
var cognit_user = userPool.getCurrentUser();

//
//	Create the storage object, so we can save data in the borwsers
//	local sotrage space.
//
var storage = Storages.localStorage;

//
//	Redirect the user to acccess page, if user session doesn't exists.
//
if(!cognit_user)
{
	//
	//	->	Redirect to the Access page
	//
	//window.location.replace('https://access.' + base_domain.domain);
}

//	 ______  _    _  _   _   _____  _______  _____  ____   _   _   _____
//	|  ____|| |  | || \ | | / ____||__   __||_   _|/ __ \ | \ | | / ____|
//	| |__   | |  | ||  \| || |        | |     | | | |  | ||  \| || (___
//	|  __|  | |  | || . ` || |        | |     | | | |  | || . ` | \___ \
//	| |     | |__| || |\  || |____    | |    _| |_| |__| || |\  | ____) |
//	|_|      \____/ |_| \_| \_____|   |_|   |_____|\____/ |_| \_||_____/
//

function get_credentials(cognit_user, callback)
{
	//
	//	1.	Check if the user session even exists.
	//
	if(!cognit_user)
	{
		return callback(new Error("No Cognito User."));
	}

	//
	//	2.	Get the user session
	//
	cognit_user.getSession(function(session_error, session) {

		//
		//	1.	Check if there was an internal error
		//
		if(session_error)
		{
			return callback("Session Error: " + JSON.stringify(session_error));
		}

		console.log("User before Attributes: ", cognit_user);

		//
		//	2.	Get the user attribute, you need to grab them after the
		//		.getSession() function is called.
		//
		cognit_user.getUserAttributes(function(attr_error, result) {

			console.log("Attributes Error: ", attr_error);
			console.log("Attributes Result: ", result);

			//
			//	1.	Check if there was an internal error
			//
			if(attr_error)
			{
				return callback("Attr Error: " + JSON.stringify(attr_error));
			}

			//
			//	2.	Object that will store the user attributes that are
			//		coming from Cognito
			//
			let attributes = {};

			//
			//	3.	Loop over the array of objects that Cognito sends back
			//		and convert that weirdness in to a regular JS object.
			//
			for(i = 0; i < result.length; i++)
			{
				attributes[result[i].getName()] = result[i].getValue();
			}

			//
			//	4.	Update the AWS object configuration with the credentials that
			//		we got from Cognito
			//
			AWS.config.credentials = new AWS.CognitoIdentityCredentials({
				IdentityPoolId : 'us-east-1:d61669b5-dbe3-450d-a971-cb5b91828fd7',
				Logins : {
					'cognito-idp.us-east-1.amazonaws.com/us-east-1_1qg7uCcA9' : session.getIdToken().getJwtToken()
				}
			});

			//
			//	5.	Create a active DDB
			//
			var ddb = new AWS.DynamoDB.DocumentClient({
				apiVersion: '2012-08-10'
			});

			//
			//	6.	Create a Lambda Invocation object
			//
			var lambda = new AWS.Lambda({
				apiVersion: '2015-03-31'
			});

			//
			//	7.	Create a S3 Object to save file directly to S3
			//
			var s3 = new AWS.S3({
				apiVersion: '2006-03-01'
			});

			// //
			// //	8.	Create a Cognito Object to check for existing users.
			// //
			// var cognito = new AWS.CognitoIdentityServiceProvider({
			// 	apiVersion: '2016-04-18'
			// });

			//
			//	->	Return the DDB
			//
			return callback(null, {
				cognito_id: AWS.config.region + ":" + cognit_user.username,
				attributes: attributes,
				ddb: ddb,
				lambda: lambda,
				s3: s3
			});

		});

	});
}

//
//	Loop over all the data that we got from the DB, and populate the
//	forms with it.
//
function populate_form(data)
{
	for(var key in data)
	{
		$('#' + key).val(data[key])
	}
}

//
//	Loop over all the data that we got from the DB, and populate the
//	HTML elements with it.
//
function populate_html(data)
{
	//
	//	1.	Loop to access all main field whether it is array or object.
	//
	for(var main_key in data) 
	{
		//
		//	1.	Store value of main field into a variable. 
		//
		var field_data = data[main_key]

		//
		//	2.	Loop to access all type of data(Array/Object/other).
		//
		for(var nested_key in field_data)
		{
			//
			//	1.	Check if field is an array.
			//
			if(Array.isArray(field_data))
			{	
				//
				//	1.	Get content of field to tart populating html. 
				//
				content = field_data;

				//
				//	2.	Change the key name into main key as it is main field.
				//
				nested_key= main_key	
			}

			//
			//	2.	Check if field is not an array.
			//
			if(!Array.isArray(field_data))
			{
				//
				//	1.	Get content of particular field using key to populating
				//		html. 
				//
				content = field_data[nested_key];	
			}

			//
			//	3.	Do following if we get array from DB.
			//
			if(Array.isArray(content))
			{
				//
				//	1.	Get ul template of specific array field.
				//
				var ul = $("#" + nested_key + " ul");

				//
				//	2.	Get li of the ul.
				//
				var li = $("#" + nested_key + " ul li");

				//
				//	3. Remove li template from html.
				//
				li.remove();

				//
				//	4. Run each loop to access its element.
				//
				$.each(content, function(key, val) {

					//
					//	1.	Loop to access key/value of object elements.
					//
					for(var simple_field_key in val)
					{
						//
						//	1.	Set content of each span exists in li.
						//
						li.find("span." + simple_field_key).text(val[simple_field_key]);
					}

					//
					//	2.	Make a clone of li and append it to the ul.
					//
					li.clone(true).appendTo(ul);

				});

				//
				//	5.	Break/stop the loop to skip rest code and to prevent
				//		the data to be populated multiple times if main 
				//		field is an array
				//
				if(Array.isArray(field_data)) 
				{
					break;
				}
				//
				//	6.	Move to next cursor of loop to skip rest code
				//		if main field is not an array .
				//
				continue;
			}

			//
			//	4.	Do following if we get object from DB.
			//
			if(!Array.isArray(content) && typeof content == 'object')
			{
				//
				//	1.	Loop to access key/value of object elements.
				//
				for(var key in content)
				{
					//
					//	1.	Set content of each span relates to the object.
					//
					$("#" + key).text(content[key]);
				}

				//
				//	2.	Move to next cursor of loop to skip rest code.
				//
				continue;
			}

			//
			//	5.	This is to set content of fields except type array and object.
			//
			$("#" + nested_key).text(content);

		}
	}
}

//
//	Go over the whole page looking for input fields and grab all the data
//	entered by the user.
//
function scrape_form(inputs)
{
	//
	//	1.	The variable that will hold all the form data as an object.
	//
	var data = {};

	//
	//	2.	Loop over every input field.
	//
	inputs.each(function() {

		//
		//	1.	Check if input is not representing any array or object.
		//
		if(!$(this).closest(".object").length && !$(this).closest(".array").length)
		{
			//
			//	1.	Get the ID of the input field and use it as the object key.
			//
			var key = $(this).attr('id');

			//
			//	2.	Check if the key exists, we can get a `undefined` that we
			//		need to skip.
			//
			if(key)
			{
				//
				//	1.	Check if the input is a button.
				//
				var is_button = $(this).is(':button');

				//
				//	2.	If the input is not a button, only then we get its
				//		value.
				//
				if(!is_button)
				{
					//
					//	1.	Check if the input is radio button.
					//
					var is_radio = $(this).is(':radio');

					//
					//	2.	If input is a radio button, save true/false in db.
					//
					if(is_radio)
					{
						//
						//	1.	Save checked(true/false) value.
						//
						data[key] = $(this).prop('checked');
					}

					//
					//	3.	If input is not a radio button, save input value in
					//		db.
					//
					if(!is_radio)
					{
						//
						//	1.	Save the value that the user wrote.
						//
						data[key] = $(this).val();
					}
				}
			}
		}

	});

	//
	//	->	Return the form data back as a JS object.
	//
	return data;
}

//
//	Function to scrap data from all the array fields for which we've added
//	array class to the div. This function searches the array class and make
//	key name as per id for that div and makes the object for all the child div
//	having input controls.
//
function scrap_array()
{
	//
	//	1.	Make a main variable to collect data.
	//
	var data = {};

	//
	//	2.	Run a loop over all array class div as we've added array class in
	//		the form over array object controls.
	//
	$('.array').each(function() {

		//
		//	1.	Make a key of array using id of main div.
		//
		var array_key = $(this).attr('id');

		//
		//	2.	Make a temporary array.
		//
		var array = [];

		//
		//	3.	Run a loop of div containing all inputs.
		//
		$(this).children('div').not(".invisible-div").each(function() {

			//
			//	1.	Make a temorary object.
			//
			var object = {};

			//
			//	2.	Run a loop of inputs inside div.
			//
			$(this).find('input').each(function() {

				//
				//	1.	Make a key using input's first class name.
				//
				var object_key = $(this).attr('class').split(' ')[0];

				//
				//	2.	Check if input is radio.
				//
				if($(this).is(':radio'))
				{

					//
					//	1. Check if radio is checked.
					//
					if($(this).prop('checked'))
					{
						//
						//	1.	Create a field in temporary object.
						//
						object[object_key] = $(this).val() == 'true';
					}

					//
					//	2.	Continue the loop and start the next cursor.
					//
					return;
				}

				//
				//	3.	If input is date then take the timestamp to save in db.
				//
				if($(this).hasClass('date'))
				{
                    //
                    //  1.  Convert date string into timestamp format.
                    //
					var time_stamp = new Date($(this).val()).getTime();

                    //
                    //  2.  Create a date field in temporary object.
                    //
					object[object_key] = time_stamp;

                    //
                    //  3.  Continue the loop and start the next cursor.
                    //
					return;
				}

				//
				//	4.	Make a field inside temporary obj and give value.
				//
				object[object_key] = $(this).val();

			})

			//
			//	3.	Push temporary object  into array.
			//
			array.push(object);

		})

		//
		//	4.	Make an array inside main object.
		//
		data[array_key] = array;

	})

	//
	//	3.	Return finalized main object scraped from submitted form
	//
	return data;
}

//
//	Function to scrap data from all the object fields for which we've added
//	object class to the div. This function searches the object class and make
//	key name as per id for that div and collects the data for all the input
//	controls in that div.
//
function scrap_object()
{
	//
	//	1.	Make a main variable to collect data.
	//
	var data = {};

	//
	//	2.	Run a loop over all Object class div as we've added object class in
	//		the form over object controls.
	//
	$('.object').each(function() {

		//
		//	1.	Make a key of object using id of main div.
		//
		var object_key = $(this).attr('id');

		//
		//	2.	Make a temporary object.
		//
		var object = {};

		//
		//	3.	Run a loop of inputs inside div.
		//
		$(this).find('input').each(function() {

			//
			//	1.	Make a key using input's id value.
			//
			var object_key = $(this).attr('id');

			//
			//	2.	Make a field inside temporary obj and give value.
			//
			object[object_key] = $(this).val();

		})

		//
		//	4.	Make an object inside main object.
		//
		data[object_key] = object;
	})

	//
	//	3.	Return finalized main object scraped from submitted form
	//
	return data;
}

//
//	Convert a Uint8Array in to a Base64 object. Why we don't use the build in
//	btoa(), because it overfills the stack for whatever reason.
//
function encode(data)
{
	//
	//	1.	Loop over the array and concatenate all the numbers in to a string.
	//
    var str = data.reduce(function(a, b) {

    	return a + String.fromCharCode(b)

    }, '');

    //
    //	->	Retunr the result
    //
    return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
}

//
//	This function binds the data to top right corner either from database or
//	from local storage
//
function bind_user_details(cognit_user) {

	//
	//	If name present in storage
	//
	if(storage.isSet('full_name'))
	{
		//
		//	1.	Grab the user name from the local storage to display in the top
		//		right corner
		//
		get_name_from_storage();
	}

	//
	//	If image present in storage
	//
	if(storage.isSet('image_data'))
	{
		//
		//	1.	Grab the user name from the local storage to display in the top
		//		right corner
		//
		get_image_from_storage();
	}

	//
	//	If name & avatar are not present in storage
	//
	if(storage.isEmpty('full_name') || storage.isEmpty('image_data'))
	{
		//
		//	1.	Grab the user name from the DB to display in the top right
		//		corner
		//
		get_full_name(cognit_user);
	}

	//
	//	If name & avatar both present in storage
	//
	if(storage.isSet(['full_name','image_data']))
	{
		//
		//	1.  Hiding CSS placeholder animation and background effect from top
		//		right corner
		//
		hide_avatar_animation();
	}
}

//
//	This function grabs just the contact information from the DB
//
function get_full_name(cognit_user)
{
	get_credentials(cognit_user, function(error, obj) {

		//
		//	1.	Check for internal errors
		//
		if(error)
		{
			return console.error(error);
		}

		//
		//	2.	DDB query
		//
		var params = {
			Key: {
				cognito_id: obj.cognito_id
			},
			TableName: "Users",
			ProjectionExpression: "contact"
		};

		//
		//	->	Execute the command
		//
		obj.ddb.get(params, function(error, data) {

			//
			//	1.	Check if there was an error
			//
			if(error)
			{
				console.error(error);
			}

			//
			//	2.	Make the full name for the user
			//
			var full_name = data.Item.contact.first_name
						 + " "
						 + data.Item.contact.last_name;
			//
			//	3.	Update the drop down menu in the top right corner with
			//		the name of the logged-in user.
			//
			$('#full_name').text(full_name);

			//
			//	4.	Set the name of logged in user in local storage
			//
			storage.set('full_name', full_name);

        	//
			//	5.	remove placeholder from name after loading it
			//
			$(".account-summary").removeClass('animated-background');

			//
			//	6.	Check to see if the user has an avatar to be grabbed
			//
			if(data.Item.contact.avatar)
			{
				//
				//	1.	Prepare the request
				//
				var params = {
					Bucket: 'drive.retireryte.net',
					Key: 'avatars/' + data.Item.contact.avatar
				};

				//
				//	->	Execute the query
				//
				obj.s3.getObject(params, function(eerrorrr, data) {

					//
					//	1.	Check if there was an error
					//
					if(error)
					{
						console.error(error);
					}

					//
					//	2.	Make sure we got something back
					//
					if(data.Body)
					{
						//
						//	1.  Hiding CSS placeholder animation after
						//		getting response from server
						//
						hide_avatar_animation();

						//
						//	2.	Convert the Array Buffer in to Base64
						//
						var base64Data = encode(data.Body);

						//
						//	3.	Set the B64 blob in local storage
						//
						storage.set('image_data', base64Data);

						//
						//	4.	Use the B64 blob as the source image
						//		for the avatar.
						//
						$('.avatar_img').attr("src", "data:image/png;base64," + base64Data);
					}

				});
			}

		});

	});
}

//
//  This function shows the loading animation on avatar
//
function show_avatar_animation()
{
	$(".account-summary").addClass('animated-background');
	$(".user-avatar").addClass('animated-background');
}

//
//  This function hides the loading animation on avatar
//
function hide_avatar_animation()
{
	$(".account-summary").removeClass('animated-background');
	$(".user-avatar").removeClass('animated-background');
}

//
//	This function removes the name and avatar from local storage
//
function clear_storage()
{
	storage.removeAll();
}

//
//	This function extracts full name from local storage and set values on page
//
function get_name_from_storage()
{
	//
	//	1.	Get name from local storage
	//
	var full_name = storage.get('full_name');

	//
	//	2.	Update the drop down menu in the top right corner with the name of
	//		the logged-in user.
	//
	$('#full_name').text(full_name);

	//
	//	3.	Hiding CSS placeholder animation for name after getting response
	//		from local storage
	//
	$(".account-summary").removeClass('animated-background');
}

//
//	This function extracts image from local storage and set values on page
//
function get_image_from_storage()
{
	//
	//	1.	Get image from local storage
	//
	var image_data = storage.get('image_data');

	//
	//	2.	Use the B64 blob as the source image for the avatar.
	//
	$('.avatar_img').attr("src", "data:image/png;base64," + image_data);

	//
	//	3.	Hiding CSS placeholder animation for avatar after getting response
	//		from local storage
	//
	$(".user-avatar").removeClass('animated-background');
}

//
//	Parse the URL to extract all the data in the query section
//
function parse_the_url()
{
	//
	//	1.	Array variable declared to hold the list of query variables
	//
	var queries = {};

	//
	//	2.	Split the string in two pieces, on the left you get the URL. One
	//		the right you get a new string with all the queries.
	//
	var left_right = window.location.href.split('?');

	//
	//	3.	Check if we have the right side, meaning the query part of the
	//		URL
	//
	if(left_right[1])
	{
		//
		//	1.	Take the string from the right side and split it again
		//		to get the individual queries.
		//
		var query = left_right[1].split('&');

		//
		//	2.	Loop over the individual queries to get to the data that we
		//		care about.
		//
		for(var i = 0; i < query.length; i++)
		{
			//
			//	1.	Split in the middle of the query to get the key and the
			//		value
			//
			var data = query[i].split('=');

			//
			//	2.	Save what we got in to the JS object
			//
			queries[data[0]] = data[1];
		}
	}

	//
	//	4.	return queries list
	//
	return queries;
}
