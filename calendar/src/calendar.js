import React, { useState } from 'react';
import moment from 'moment';
import { CSSTransition } from 'react-transition-group'; // Yangi import
import './calendar.css'; // SCSS natijasini chaqirish

const DayNames = () => (
  <div className="row days-header">
    <span className="box day-name">Mon</span>
    <span className="box day-name">Tue</span>
    <span className="box day-name">Wed</span>
    <span className="box day-name">Thu</span>
    <span className="box day-name">Fri</span>
    <span className="box day-name">Sat</span>
    <span className="box day-name">Sun</span>
  </div>
);

const Day = ({ day, selected, select }) => (
  <div
    className={`day${day.isToday ? ' today' : ''}${
      day.isCurrentMonth ? '' : ' different-month'
    }${day.date.isSame(selected) ? ' selected' : ''}${
      day.hasEvents ? ' has-events' : ''
    }`}
    onClick={() => select(day)}
  >
    <div className="day-number">{day.number}</div>
  </div>
);

const Week = ({ previousCurrentNextView, currentMonthView, selected, select, monthEvents }) => {
  let days = [];
  let date = previousCurrentNextView;
  let monthIndex = date.month();
  let count = 0;

  while (count < 7) {
    const dayHasEvents = monthEvents.some(event => event.date.isSame(date, 'day'));

    const day = {
      name: date.format('dd').substring(0, 1),
      number: date.date(),
      isCurrentMonth: date.month() === currentMonthView.month(),
      isToday: date.isSame(new Date(), 'day'),
      date: date,
      hasEvents: dayHasEvents,
    };

    days.push(<Day key={day.date.toString()} day={day} selected={selected} select={select} />);
    date = date.clone();
    date.add(1, 'd');
    count++;
  }

  return <div className="row week">{days}</div>;
};

const Events = ({ selectedMonth, selectedDay, selectedMonthEvents, removeEvent }) => {
  const monthEventsRendered = selectedMonthEvents.map((event, i) => (
    <div
      key={event.title}
      className="event-container"
      onClick={() => removeEvent(i)}
    >
      <CSSTransition
        classNames="time"
        appear={true}
        appearTimeout={500}
        enterTimeout={500}
        leaveTimeout={500}
      >
        <div className="event-time event-attribute">
          {event.date.format('HH:mm')}
        </div>
      </CSSTransition>
      <CSSTransition
        classNames="title"
        appear={true}
        appearTimeout={500}
        enterTimeout={500}
        leaveTimeout={500}
      >
        <div className="event-title event-attribute">{event.title}</div>
      </CSSTransition>
    </div>
  ));

  const dayEventsRendered = monthEventsRendered.filter(event => event.props.day.date.isSame(selectedDay, 'day'));

  return <div className="day-events">{dayEventsRendered}</div>;
};

const Calendar = () => {
  const [state, setState] = useState({
    selectedMonth: moment(),
    selectedDay: moment().startOf('day'),
    selectedMonthEvents: [],
    showEvents: false,
  });

  const previous = () => {
    const currentMonthView = state.selectedMonth;

    setState({
      selectedMonth: currentMonthView.subtract(1, 'month'),
      selectedDay: state.selectedDay,
      selectedMonthEvents: state.selectedMonthEvents,
      showEvents: false,
    });
  };

  const next = () => {
    const currentMonthView = state.selectedMonth;

    setState({
      selectedMonth: currentMonthView.add(1, 'month'),
      selectedDay: state.selectedDay,
      selectedMonthEvents: state.selectedMonthEvents,
      showEvents: false,
    });
  };

  const select = day => {
    setState({
      selectedMonth: day.date,
      selectedDay: day.date.clone(),
      selectedMonthEvents: state.selectedMonthEvents,
      showEvents: true,
    });
  };

  const goToCurrentMonthView = () => {
    setState({
      selectedMonth: moment(),
      selectedDay: state.selectedDay,
      selectedMonthEvents: state.selectedMonthEvents,
      showEvents: true,
    });
  };

  const showCalendar = () => {
    setState({
      selectedMonth: state.selectedMonth,
      selectedDay: state.selectedDay,
      selectedMonthEvents: state.selectedMonthEvents,
      showEvents: false,
    });
  };

  const renderMonthLabel = () => (
    <span className="box month-label">
      {state.selectedMonth.format('MMMM YYYY')}
    </span>
  );

  const renderDayLabel = () => (
    <span className="box month-label">
      {state.selectedDay.format('DD MMMM YYYY')}
    </span>
  );

  const renderTodayLabel = () => (
    <span className="box today-label" onClick={goToCurrentMonthView}>
      Today
    </span>
  );

  const renderWeeks = () => {
    const currentMonthView = state.selectedMonth;
    const currentSelectedDay = state.selectedDay;
    const monthEvents = state.selectedMonthEvents;

    let weeks = [];
    let done = false;
    let previousCurrentNextView = currentMonthView
      .clone()
      .startOf('month')
      .subtract(1, 'd')
      .day('Monday');
    let count = 0;
    let monthIndex = previousCurrentNextView.month();

    while (!done) {
      weeks.push(
        <Week
          key={previousCurrentNextView.toString()}
          previousCurrentNextView={previousCurrentNextView.clone()}
          currentMonthView={currentMonthView}
          monthEvents={monthEvents}
          selected={currentSelectedDay}
          select={day => select(day)}
        />
      );
      previousCurrentNextView.add(1, 'w');
      done = count++ > 2 && monthIndex !== previousCurrentNextView.month();
      monthIndex = previousCurrentNextView.month();
    }

    return weeks;
  };

  const handleAdd = () => {
    const monthEvents = state.selectedMonthEvents;
    const currentSelectedDate = state.selectedDay;

    let newEvents = [];

    const eventTitle = prompt('Please enter a name for your event: ');

    switch (eventTitle) {
      case '':
        alert('Event name cannot be empty.');
        break;
      case null:
        alert("Changed your mind? You can add one later!");
        break;
      default:
        const newEvent = {
          title: eventTitle,
          date: currentSelectedDate,
          dynamic: true,
        };

        newEvents.push(newEvent);

        for (let i = 0; i < newEvents.length; i++) {
          monthEvents.push(newEvents[i]);
        }

        setState({
          selectedMonth: state.selectedMonth,
          selectedDay: state.selectedDay,
          selectedMonthEvents: monthEvents,
          showEvents: state.showEvents,
        });
        break;
    }
  };

  // const addEvent = () => {
  //   const currentSelectedDate = state.selectedDay;
  //   const isAfterDay = moment().startOf('day').subtract(1, 'd');

  //   if (currentSelectedDate.isAfter(isAfterDay)) {
  //     handleAdd();
  //   } else {
  //     if (window.confirm('Are you sure you want to add an event in the past?')) {
  //       handleAdd();
  //     }
  //   }
  // };

  // const removeEvent = i => {
  //   const monthEvents = state.selectedMonthEvents.slice();
  //   const currentSelectedDate = state.selectedDay;

  //   if (window.confirm('Are you sure you want to remove this event?')) {
  //     const index = i;

  //     if (index !== -1) {
  //       monthEvents.splice(index, 1);
  //     } else {
  //       alert('No events to remove on this day!');
  //     }

  //     setState({
  //       selectedMonth: state.selectedMonth,
  //       selectedDay: state.selectedDay,
  //       selectedMonthEvents: monthEvents,
  //       showEvents: state.showEvents,
  //     });
  //   }
  // };

  // const initialiseEvents = () => {
  //   const monthEvents = state.selectedMonthEvents;

  //   const allEvents = [
  //     {
  //       title:
  //         "Press the Add button and enter a name for your event. P.S you can delete me by pressing me!",
  //       date: moment(),
  //       dynamic: false,
  //     },
  //     {
  //       title: "Event 2 - Meeting",
  //       date: moment().startOf('day').subtract(2, 'd').add(2, 'h'),
  //       dynamic: false,
  //     },
  //     {
  //       title: "Event 3 - Cinema",
  //       date: moment().startOf('day').subtract(7, 'd').add(18, 'h'),
  //       dynamic: false,
  //     },
  //     {
  //       title: "Event 4 - Theater",
  //       date: moment().startOf('day').subtract(16, 'd').add(20, 'h'),
  //       dynamic: false,
  //     },
  //     {
  //       title: "Event 5 - Drinks",
  //       date: moment().startOf('day').subtract(2, 'd').add(12, 'h'),
  //       dynamic: false,
  //     },
  //     {
  //       title: "Event 6 - Diving",
  //       date: moment().startOf('day').subtract(2, 'd').add(13, 'h'),
  //       dynamic: false,
  //     },
  //     {
  //       title: "Event 7 - Tennis",
  //       date: moment().startOf('day').subtract(2, 'd').add(14, 'h'),
  //       dynamic: false,
  //     },
  //     {
  //       title: "Event 8 - Swimmming",
  //       date: moment().startOf('day').subtract(2, 'd').add(17, 'h'),
  //       dynamic: false,
  //     },
  //     {
  //       title: "Event 9 - Chilling",
  //       date: moment().startOf('day').subtract(2, 'd').add(16, 'h'),
  //       dynamic: false,
  //     },
  //     {
  //       title: "Hello World",
  //       date: moment().startOf('day').add(5, 'h'),
  //       dynamic: false,
  //     },
  //   ];

  //   for (let i = 0; i < allEvents.length; i++) {
  //     monthEvents.push(allEvents[i]);
  //   }

  //   setState({
  //     selectedMonth: state.selectedMonth,
  //     selectedDay: state.selectedDay,
  //     selectedMonthEvents: monthEvents,
  //     showEvents: state.showEvents,
  //   });
  // };

  return state.showEvents ? (
    <section className="main-calendar">
      <header className="calendar-header">
        <div className="row title-header">
          {renderDayLabel()}
        </div>
        <div className="row button-container">
          <i className="box arrow fa fa-angle-left" onClick={showCalendar} />
          {/* <i className="box event-button fa fa-plus-square" onClick={addEvent} /> */}
        </div>
      </header>
      <Events
        selectedMonth={state.selectedMonth}
        selectedDay={state.selectedDay}
        selectedMonthEvents={state.selectedMonthEvents}
        // removeEvent={i => removeEvent(i)}
      />
    </section>
  ) : (
    <section className="main-calendar">
      <header className="calendar-header">
        <div className="row title-header">
          <i className="box arrow fa fa-angle-left" onClick={previous} />
          <div className="box header-text">
            {renderTodayLabel()}
            {renderMonthLabel()}
          </div>
          <i className="box arrow fa fa-angle-right" onClick={next} />
        </div>
        <DayNames />
      </header>
      <div className="days-container">
        {renderWeeks()}
      </div>
    </section>
  );
};

export default Calendar;

