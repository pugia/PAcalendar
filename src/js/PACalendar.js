// PAwidget Plugin
(function ($) {
	
  $.fn.PACalendar = function( options ) {

		var self = this;
			  
		// default options
    var settings = $.extend(true, {
				prevArrow:	 '&laquo;'
			,	nextArrow:	 '&raquo;'
			,	from: {
					date: moment(),
					element: $('[data-element="from"]')
				}
			,	to:	{
					date: null,
					element: $('[data-element="to"]')
				}
			,	mode: 'date' // range
			,	locale: moment.locale()
			, format: 'YYYY-MM-DD'
		}, options );
		
		moment.locale(settings.locale);
								
		var _id = Math.random().toString(36).substring(7);
				
		// fixing values
		if (settings.from.element) {
			settings.from.date = moment(settings.from.element.val(), settings.format);
			if (!settings.from.date.isValid()) { settings.from.date = moment(); }
			settings.from.element.val(moment(settings.from.date).format(settings.format));
		}
		if (settings.to.element) {
			settings.to.date = moment(settings.to.element.val(), settings.format);
			if (!settings.to.date.isValid()) { settings.to.date = moment(); }
			settings.to.element.val(moment(settings.to.date).format(settings.format));
			if (settings.to.date.isBefore(settings.from.date)) { 
				settings.to.element.val(''); 
				settings.to.date = null; 
			}
			
		}
		
		var mode = true;
		var displayDate = moment(settings.from.date);
		var selectedDateFrom = moment(settings.from.date);
		var selectedDateTo = (settings.mode == 'range') ? moment(settings.to.date) : null;
		settings.from.element.addClass('active');
		// elements
		var headerEl, headerPrevEl, headerNextEl, headerMonthEl, weekEl, monthEl;
		
		createStructure();
		popolateCalendar(displayDate);	
		monthEl.addClass(mode ? 'from' : 'to');
		
		headerNextEl
			.off('click')
			.on('click', function() {
				
				displayDate.add(1, 'months');
				popolateCalendar(displayDate);
				
			})
			
		headerPrevEl
			.off('click')
			.on('click', function() {
				
				displayDate.subtract(1, 'months');
				popolateCalendar(displayDate);
				
			})
			
		monthEl
			.off('click', 'span.active')
			.on('click', 'span.active', function() {
								
				var modeClass = mode ? 'to' : 'from';
				console.log(modeClass);
				monthEl.find('span:not(.'+modeClass+')').removeClass('selected')
				$(this).addClass('selected');
				var selectedDate = moment($(this).attr('data-value'), 'YYYYMMDD');
				
				if (mode) {
					selectedDateFrom = selectedDate;
					if (settings.from.element) {
						settings.from.element.val(moment(selectedDate, 'YYYYMMDD').format(settings.format));
					}
				}
								
				if (settings.mode == 'range') {
					
					if (!mode) {
						selectedDateTo = selectedDate;
						if (settings.to.element) {
							settings.to.element.val(moment(selectedDate, 'YYYYMMDD').format(settings.format));
						}
					}
					
					monthEl.find('span').removeClass(mode ? 'from' : 'to');
					$(this).addClass(mode ? 'from' : 'to');
					
					if (selectedDateTo < selectedDateFrom) {
						
						monthEl.find('span').removeClass('selected between from to');
						$(this).addClass('selected from');
						selectedDateFrom = selectedDate;
						selectedDateTo = null;
						if (settings.from.element) {
							settings.from.element.val(moment(selectedDate, 'YYYYMMDD').format(settings.format));
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
						from: moment(selectedDateFrom),
						to: moment(selectedDateTo)
					});
				}

				if (settings.mode != 'range' && selectedDateFrom) {
					self.trigger({
						type: 'setDate',
						from: moment(selectedDateFrom)
					});
				}
				
				$('.PAcalendar_element[rel="'+ _id +'"]').removeClass('active');
				settings[mode ? 'from' : 'to'].element.addClass('active');
								
				cellsBetween();
				
			})
			
		if (settings.from.element) {
			
			settings.from.element
				.off('change keyup')
				.on('change keyup', function() {

					var date = moment($(this).val(), settings.format);
					if (date.isValid()) {
						monthEl.find('span:not(.to)').removeClass('selected from')
						monthEl.find('span[data-value="'+ date.format('YYYYMMDD') +'"]').addClass('selected from');
						selectedDateFrom = moment(date);
						cellsBetween();
					}
				})
				.off('focus')
				.on('focus', function() {
					mode = true;
					$('.PAcalendar_element[rel="'+ _id +'"]').removeClass('active');
					settings.from.element.addClass('active');
				})
			
			}
			
		if (settings.to.element) {
			settings.to.element
				.off('change keyup')
				.on('change keyup', function() {

					var date = moment($(this).val(), settings.format);
					if (date.isValid()) {
						monthEl.find('span:not(.from)').removeClass('selected to')
						monthEl.find('span[data-value="'+ date.format('YYYYMMDD') +'"]').addClass('selected to');
						
						selectedDateTo = moment(date);
						cellsBetween();
					}
				})
				.off('focus')
				.on('focus', function() {
					mode = false;
					$('.PAcalendar_element[rel="'+ _id +'"]').removeClass('active');
					settings.to.element.addClass('active');
				})

			
		}
		
		// events
		// change mode
		self.setMode = function(newMode) {
			if (newMode == 'range' || newMode == 'date') {
				settingsmode = newMode;
				popolateCalendar(selectedDateFrom);	
			}
		}
		
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
			for (i = 1; i < 8; i++) {	weekEl.append($('<span></span>').text(moment().day(i).format('dd')));	}
			
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
				
			settings.from.element.addClass('PAcalendar_element').attr('rel', _id);
			settings.to.element.addClass('PAcalendar_element').attr('rel', _id);
			
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
				var value = moment(momentDate);
				var span = $('<span></span>')
										.text(dd)
										.attr('data-value', value.format('YYYYMMDD'))
										.toggleClass('active', (mm == current_month))
				
				if (settings.mode == 'range') {
					span.toggleClass('from', selectedDateFrom.isSame(value));
					span.toggleClass('to', selectedDateTo.isSame(value));
				}
				
				monthEl.append(span);
				momentDate.add(1, 'days');
			}
			
			cellsBetween();
			
		}
		
		function cellsBetween() {
			
			monthEl
				.find('span')
				.removeClass('selected from to between');
			
			if (settings.mode == 'range' && selectedDateTo.isValid() && selectedDateFrom.isValid() && selectedDateFrom.isBefore(selectedDateTo)) {
				
				monthEl.find('span[data-value]')
					.each(function(i,e) {
						var d = moment($(e).attr('data-value'), 'YYYYMMDD');
						$(e).toggleClass('between', d.isAfter(selectedDateFrom) && d.isBefore(selectedDateTo));
					})
				
			}
			
			monthEl.find('span[data-value="'+ selectedDateFrom.format('YYYYMMDD') +'"]').removeClass('between').addClass('selected from');
			monthEl.find('span[data-value="'+ selectedDateTo.format('YYYYMMDD') +'"]').removeClass('between').addClass('selected to');
			
		}
		
	};

}( jQuery ));
