// PAwidget Plugin
(function ($) {
	
  $.fn.PACalendar = function( options ) {
	  
		// default options
    var settings = $.extend({
				prevArrow:	 '&lt;'
			,	nextArrow:	 '&gt;'
			,	from: {
					date: moment().format('YYYY-MM-DD'),
					element: null
				}
			,	to:	{
					date: null,
					element: null
				}
			,	mode: 'date' // range
		}, options );
								
		var self = this;
		var _id = Math.random().toString(36).substring(7);
		
		// fixing values
		if (settings.from.date == null && settings.from.element) {
			settings.from.date = moment(settings.from.element.val());
		}
		if (settings.to.date == null && settings.to.element) {
			settings.to.date = moment(settings.to.element.val());
		}
						
		var mode = true;
		var displayDate = moment(settings.from.date);
		var selectedDateFrom = moment(settings.from.date).format('YYYYMMDD');
		var selectedDateTo = (settings.mode == 'range') ? moment(settings.to.date).format('YYYYMMDD') : null;
		
		// elements
		var headerEl, headerPrevEl, headerNextEl, headerMonthEl, weekEl, monthEl;
		
		createStructure();
		popolateCalendar(displayDate);	
		monthEl.addClass(mode ? 'from' : 'to');

		// events
		self.refresh = function() {
			console.log('refresh');
		}
		
		headerNextEl
			.on('click', function() {
				
				displayDate.add(1, 'months');
				popolateCalendar(displayDate);
				
			})
			
		headerPrevEl
			.on('click', function() {
				
				displayDate.subtract(1, 'months');
				popolateCalendar(displayDate);
				
			})
			
		monthEl
			.on('click', 'span.active', function() {
								
				var modeClass = mode ? 'to' : 'from';
								
				monthEl.find('span:not(.'+modeClass+')').removeClass('selected')
				$(this).addClass('selected');
				var selectedDate = $(this).data('value');
				
				if (mode) {
					selectedDateFrom = selectedDate;
					if (settings.from.element) {
						settings.from.element.val(moment(selectedDate, 'YYYYMMDD').format('YYYY-MM-DD'));
					}
				}
								
				if (settings.mode == 'range') {
					
					if (!mode) {
						selectedDateTo = selectedDate;
						if (settings.to.element) {
							settings.to.element.val(moment(selectedDate, 'YYYYMMDD').format('YYYY-MM-DD'));
						}
					}
					
					monthEl.find('span').removeClass(mode ? 'from' : 'to');
					$(this).addClass(mode ? 'from' : 'to');
					
					if (selectedDateTo < selectedDateFrom) {
						
						monthEl.find('span').removeClass('selected between from to');
						$(this).addClass('selected from');
						selectedDateFrom = selectedDateTo;
						selectedDateTo = null;
						if (settings.from.element) {
							settings.from.element.val(moment(selectedDate, 'YYYYMMDD').format('YYYY-MM-DD'));
						}
						if (settings.to.element) {
							settings.to.element.val('');
						}
						mode = false;
						
					} else {
						mode = !mode;
					}
					
				}
				
				if (settings.mode == 'range' && selectedDateFrom && selectedDateTo) {
					self.trigger({
						type: 'setDate', 
						from: parseInt(selectedDateFrom), 
						to: parseInt(selectedDateTo)
					});
				}

				if (settings.mode != 'range' && selectedDateFrom) {
					self.trigger({
						type: 'setDate',
						from: parseInt(selectedDateFrom)
					});
				}

				
				$('.date_element[rel="'+ _id +'"]').removeClass('active');
				settings[mode ? 'from' : 'to'].element.addClass('active');
				
				cellsBetween();
				
			})
		
		return self;
		
		// create structure
		function createStructure() {
			
			// header
			headerEl = $('<header></header>').addClass('PAheader');
			headerPrevEl = $('<span></span>').html(settings.prevArrow).addClass('PAHprev');
			headerNextEl = $('<span></span>').html(settings.nextArrow).addClass('PAHnext');
			headerMonthEl = $('<span></span>').addClass('PAHmonth');
			
			// week
			weekEl = $('<section></section>').addClass('PAweek');
			for (i = 1; i < 8; i++) {	weekEl.append($('<span></span>').text(moment().weekday(i).format('dd')));	}
			
			// month
			monthEl = $('<section></section>').addClass('PAmonth')
			
			headerEl
				.append(headerPrevEl)
				.append(headerMonthEl)
				.append(headerNextEl)
								
			self
				.addClass('PACalendar')
				.append(headerEl)	
				.append(weekEl)
				.append(monthEl)	
				
			settings.from.element.addClass('date_element').attr('rel', _id);
			settings.to.element.addClass('date_element').attr('rel', _id);
			
		}
		
		function popolateCalendar(date) {
			
			var momentDate = moment(date);
			var current_month = momentDate.month();
			var current_year = momentDate.year();

			headerMonthEl.text(momentDate.format('MMMM YYYY')).attr('data-month', current_month).attr('data-year', current_year);
										
			// set start position from the first day of the week
			momentDate.set('date', 1);
			momentDate.subtract((momentDate.day() || 8)-1, 'days');
			
			monthEl.find('span').remove();
			
			for (i = 0; i < 42; i++) {
				var dd = momentDate.date();
				var mm = momentDate.month();
				var value = momentDate.format('YYYYMMDD');
				var span = $('<span></span>')
										.text(dd)
										.attr('data-value', value)
										.toggleClass('active', (mm == current_month))
										.toggleClass('selected', selectedDateFrom == value || selectedDateTo == value)
				
				if (settings.mode == 'range') {
					span.toggleClass('from', selectedDateFrom == value);
					span.toggleClass('to', selectedDateTo == value);
				}
				
				monthEl.append(span);
				momentDate.add(1, 'days');
			}
			
			cellsBetween();
			
		}
		
		function cellsBetween() {
			
			monthEl
				.find('span')
				.removeClass('between');
				
			
			
			if (settings.mode == 'range' && selectedDateTo != null && selectedDateFrom < selectedDateTo) {
				
				monthEl
					.find('.from')
						.nextUntil('span.to')
						.addClass('between');
				
			}
			
		}
		
	};



}( jQuery ));
