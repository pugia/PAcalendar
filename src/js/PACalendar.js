// PAwidget Plugin
(function ($) {
	
  $.fn.PACalendar = function( options ) {

		var self = this;
			  
		// default options
    var settings = $.extend(true, {
			prevArrow:	 '&laquo;',
			nextArrow:	 '&raquo;',
			from: {
				date: moment(),
				element: $('[data-element="from"]')
			},	
			to:	{
				date: null,
				element: $('[data-element="to"]')
			},
			mode: 'date', // range
			rangeInterval: null, // work only for range mode, priority to "from" date
			limit_to: null,
			limit_from: null,
			locale: moment.locale(),
			format: 'YYYY-MM-DD'
		}, options );
		
		moment.locale(settings.locale);
								
		var _id = Math.random().toString(36).substring(7);
				
		// fixing values
		if (settings.from.element) {
			settings.from.date = moment(settings.from.element.val(), settings.format);
			if (!settings.from.date.isValid()) { settings.from.date = moment(); }
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
		var selectedDateTo = (settings.mode === 'range') ? moment(settings.to.date) : null;
		settings.from.element.addClass('PAactive');
		// elements
		var headerEl, headerPrevEl, headerNextEl, headerMonthEl, weekEl, monthEl;
				
		// methods
		function createStructure() {
			
			// header
			headerEl = $('<header></header>').addClass('PAheader');
			headerPrevEl = $('<span></span>').html(settings.prevArrow).addClass('PAHprev');
			headerNextEl = $('<span></span>').html(settings.nextArrow).addClass('PAHnext');
			headerMonthEl = $('<span></span>').addClass('PAHmonth');
			
			// week
			weekEl = $('<section></section>').addClass('PAweek');
			for (var i = 1; i < 8; i++) {	weekEl.append($('<span></span>').text(moment().day(i).format('dd')));	}
			
			// month
			monthEl = $('<section></section>').addClass('PAmonth');
			
			headerEl
				.append(headerPrevEl)
				.append(headerMonthEl)
				.append(headerNextEl);
								
			self
				.addClass('PACalendar')
				.append(headerEl)	
				.append(weekEl)
				.append(monthEl)	;
				
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
			
			for (var i = 0; i < 42; i++) {
				var dd = momentDate.date();
				var mm = momentDate.month();
				var value = moment(momentDate);
				
				var active = false;
				active = mm === current_month;
				if (settings.limit_to) { active = momentDate.isBefore(settings.limit_to); }
				if (settings.limit_from) { active = momentDate.isAfter(settings.limit_from); }
				
				var span = $('<span></span>')
										.text(dd)
										.attr('data-value', value.format('YYYYMMDD'))
										.toggleClass('PAactive', active);
				
				if (settings.mode === 'range') {
					span.toggleClass('PAfrom', selectedDateFrom.isSame(value));
					if (selectedDateTo && selectedDateTo.isValid()) {
						span.toggleClass('PAto', selectedDateTo.isSame(value));
					}
				}
				
				monthEl.append(span);
				momentDate.add(1, 'days');
			}
			
			cellsBetween();
			
		}
		function cellsBetween() {
			
			monthEl
				.find('span')
				.removeClass('PAselected PAfrom PAto PAbetween');
			
			if (settings.mode === 'range' && selectedDateTo && selectedDateTo.isValid() && selectedDateFrom.isValid() && selectedDateFrom.isBefore(selectedDateTo)) {
				
				monthEl.find('span[data-value]')
					.each(function(i,e) {
						var d = moment($(e).attr('data-value'), 'YYYYMMDD');
						$(e).toggleClass('PAbetween', d.isAfter(selectedDateFrom) && d.isBefore(selectedDateTo));
					});
				
			}
			
			monthEl.find('span[data-value="'+ selectedDateFrom.format('YYYYMMDD') +'"]').removeClass('PAbetween').addClass('PAselected PAfrom');
			if (settings.mode === 'range' && selectedDateTo && selectedDateTo.isValid()) {
				monthEl.find('span[data-value="'+ selectedDateTo.format('YYYYMMDD') +'"]').removeClass('PAbetween').addClass('PAselected PAto');
			}
			
		}
		
		// fix TO value 
		function fixRange(fromTop) {

			fromTop = (typeof fromTop === 'undefined') ? false : true;

			if (settings.rangeInterval && settings.rangeInterval.length === 2 && settings.rangeInterval instanceof Array && settings.mode === 'range') {
				
				if (!fromTop) {
					selectedDateTo = moment(selectedDateFrom).add(settings.rangeInterval[0], settings.rangeInterval[1]).subtract(1,'d');
				} else {
					selectedDateFrom = moment(selectedDateTo).subtract(settings.rangeInterval[0], settings.rangeInterval[1]).add(1,'d');
				}
				
				if (!fromTop && settings.to.element) {
					settings.to.element.val(moment(selectedDateTo).format(settings.format));
				}
				if (fromTop && settings.from.element) {
					settings.from.element.val(moment(selectedDateFrom).format(settings.format));				
				}
				
			}

		}
		
		fixRange();
		createStructure();
		popolateCalendar(displayDate);	
		monthEl.addClass(mode ? 'PAfrom' : 'PAto');
		
		headerNextEl
			.off('click')
			.on('click', function() {
				
				displayDate.add(1, 'months');
				popolateCalendar(displayDate);
				
			});
			
		headerPrevEl
			.off('click')
			.on('click', function() {
				
				displayDate.subtract(1, 'months');
				popolateCalendar(displayDate);
				
			});
		
		monthEl
			.off('click', 'span.PAactive')
			.on('click', 'span.PAactive', function() {
				
					
					var modeClass = mode ? 'PAto' : 'PAfrom';
					monthEl.find('span:not(.'+modeClass+')').removeClass('PAselected');
					$(this).addClass('PAselected');
					var selectedDate = moment($(this).attr('data-value'), 'YYYYMMDD');
					
					if (mode) {
						selectedDateFrom = selectedDate;
						if (settings.from.element) {
							settings.from.element.val(moment(selectedDate, 'YYYYMMDD').format(settings.format));
						}
					}
									
					if (settings.mode === 'range') {
						
						if (!mode) {
							selectedDateTo = selectedDate;
							if (settings.to.element) {
								settings.to.element.val(moment(selectedDate, 'YYYYMMDD').format(settings.format));
							}
						}
						
						fixRange();
						
						monthEl.find('span').removeClass(mode ? 'PAfrom' : 'PAto');
						$(this).addClass(mode ? 'PAfrom' : 'PAto');
						
						if (selectedDateTo < selectedDateFrom) {
							
							monthEl.find('span').removeClass('PAselected PAbetween PAfrom PAto');
							$(this).addClass('PAselected PAfrom');
							selectedDateFrom = selectedDate;
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
						
						if (settings.rangeInterval && settings.rangeInterval.length === 2 && settings.rangeInterval instanceof Array) {
							mode = true;	
						}
						
					}
					
					if (settings.mode === 'range' && selectedDateFrom && selectedDateTo) {
						self.trigger({
							type: 'setDate', 
							from: moment(selectedDateFrom),
							to: moment(selectedDateTo)
						});
					}
	
					if (settings.mode !== 'range' && selectedDateFrom) {
						self.trigger({
							type: 'setDate',
							from: moment(selectedDateFrom)
						});
					}
					
					
					$('.PAcalendar_element[rel="'+ _id +'"]').removeClass('PAactive');
					settings[mode ? 'from' : 'to'].element.addClass('PAactive');
									
					cellsBetween();
				
			
				
			});
			
		if (settings.from.element) {
			
			settings.from.element
				.off('change keyup')
				.on('change keyup', function() {
					
					self.setDateFrom($(this).val());

				})
				.off('focus')
				.on('focus', function() {
					mode = true;
					$('.PAcalendar_element[rel="'+ _id +'"]').removeClass('PAactive');
					settings.from.element.addClass('PAactive');
				});
			
			}
			
		if (settings.to.element) {
			settings.to.element
				.off('change keyup')
				.on('change keyup', function() {
					
					self.setDateTo($(this).val());

				})
				.off('focus')
				.on('focus', function() {
					mode = (settings.rangeInterval && settings.rangeInterval.length === 2 && settings.rangeInterval instanceof Array && settings.mode === 'range') ? true: false;
					$('.PAcalendar_element[rel="'+ _id +'"]').removeClass('PAactive');
					settings.to.element.addClass('PAactive');
				});

			
		}
		
		// EVENTS
		// change mode
		self.setMode = function(newMode) {
			if ((newMode === 'range' || newMode === 'date') && settings.mode !== newMode) {
				settings.mode = newMode;
				
				if (settings.mode === 'date') { selectedDateTo = null; }
				fixRange();
				popolateCalendar(selectedDateFrom);	
				return true;
			} else {
				return false;
			}
		};
		
		// change from date
		self.setDateFrom = function(changeDate) {
			
			var date = moment(changeDate, settings.format);
			if (date.isValid()) {
				monthEl.find('span:not(.PAto)').removeClass('PAselected PAfrom');
				monthEl.find('span[data-value="'+ date.format('YYYYMMDD') +'"]').addClass('PAselected PAfrom');
				selectedDateFrom = moment(date);
				
				fixRange();
				cellsBetween();
				
				return true;
			} else {
				return false;
			}
			
		};
		
		// change to date
		self.setDateTo = function(changeDate) {
			
			var date = moment(changeDate, settings.format);
			if (date.isValid()) {
				monthEl.find('span:not(.PAfrom)').removeClass('PAselected PAto');
				monthEl.find('span[data-value="'+ date.format('YYYYMMDD') +'"]').addClass('PAselected PAto');
				selectedDateTo = moment(date);
				
				fixRange(true);
				cellsBetween();
				
				return true;
			} else {
				return false;
			}
			
		};
		
		// set range interval
		self.setRangeInterval = function(interval) {
			
			settings.rangeInterval = interval;
			
			fixRange();
			cellsBetween();
			
		};
		
		// change both dates
		self.setDate = function(changeFrom, changeTo) {
			return (self.setDateFrom(changeFrom) && self.setDateTo(changeTo));
		};
		
		return self;
				
	};

}( jQuery ));
