import React, { Component } from "react";
import Loading from "./Loading";
import classnames from "classnames";
import Panel from "./Panel";
import axios from "axios";
import {
   getTotalInterviews,
   getLeastPopularTimeSlot,
   getMostPopularDay,
   getInterviewsPerDay,
} from "helpers/selectors";

// Default data
const data = [
   {
      id: 1,
      label: "Total Interviews",
      getValue: getTotalInterviews,
   },
   {
      id: 2,
      label: "Least Popular Time Slot",
      getValue: getLeastPopularTimeSlot,
   },
   {
      id: 3,
      label: "Most Popular Day",
      getValue: getMostPopularDay,
   },
   {
      id: 4,
      label: "Interviews Per Day",
      getValue: getInterviewsPerDay,
   },
];

class Dashboard extends Component {
   state = {
      loading: true,
      focused: null,
      days: [],
      appointments: {},
      interviewers: {},
   };

   selectPanel(id) {
      this.setState((previousState) => ({
         focused: previousState.focused !== null ? null : id,
      }));
   }

   componentDidMount() {
      // Get focused by parsing data from local storage
      const focused = JSON.parse(localStorage.getItem("focused"));

      // If focus is in localStorage, then set state to saved id
      if (focused) {
         this.setState({ focused });
      }

      // On mount, request data to render onto page
      Promise.all([
         axios.get("/api/days"),
         axios.get("/api/appointments"),
         axios.get("/api/interviewers"),
      ]).then(([days, appointments, interviewers]) => {
         this.setState({
            loading: false,
            days: days.data,
            appointments: appointments.data,
            interviewers: interviewers.data,
         });
      });
   }

   componentDidUpdate(previousProps, previousState) {
      if (previousState.focused !== this.state.focused) {
         localStorage.setItem("focused", JSON.stringify(this.state.focused));
      }
   }

   render() {
      console.log(this.state);
      const dashboardClasses = classnames("dashboard", {
         "dashboard--focused": this.state.focused,
      });

      if (this.state.loading) {
         return <Loading />;
      }

      // Render out panels onto page
      const panels = (
         this.state.focused ? data.filter((panel) => this.state.focused === panel.id) : data
      ).map((panel) => (
         <Panel
            key={panel.id}
            id={panel.id}
            label={panel.label}
            value={panel.getValue(this.state)}
            onSelect={() => this.selectPanel(panel.id)}
         />
      ));

      return <main className={dashboardClasses}>{panels}</main>;
   }
}

export default Dashboard;
