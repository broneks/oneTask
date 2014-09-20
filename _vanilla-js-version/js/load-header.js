(function(title, tag) {
	var headerF = headerC = '<a href="/">Back to <em>YHOJ</em></a>';
	tag.innerHTML = (title === 'Congrats!') ? headerC : headerF;
})(document.title, document.getElementById('header'));