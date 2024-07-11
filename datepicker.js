const template = document.createElement("template");

template.innerHTML = `
    <style>
        .container {
            position: relative;

            font-family: Arial, Helvetica, sans-serif;
            font-size: 10pt;
        }

        input {
        }

        .dropdown {
            padding: 5px;
            position: absolute;
            background: #f8f8f8;
            color: black;

            border-radius: 3px;
            box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
            z-index: 1;
        }

        .visible {
            background: #eee;
            width: 210px;
            display: flex;
            flex-direction: column;
            padding: 5px;
            border-collapse: separate;
            border-spacing: 15px;
            cursor: pointer;
        }

        .hidden {
            display: none;
        }

        .select-month,
        .select-year {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }

        #year,
        #month {
            text-align: center;
            font-weight: bold;
        }

        .headers {
            display: flex;
            justify-content: space-around;
            font-weight: bold;
        }

        .header,
        .cell {
            display: flex;
            height: 30px;

            align-items: center;
            justify-content: center;

            border-radius: 3px;
        }

        .dates {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            grid-template-rows: repeat(6, 1fr);
            gap: 2px;
        }

        .cell {
            text-align: center;
            background: #fff;
            border-radius: 2px;
            border-width: 5px;
        }

        .cell:hover {
            background: #eee;
        }

        .active {
            background: #ccc;
        }

        button {
            background: #ccc;
            border: none;
            border-radius: 2px;
            cursor: pointer;
        }

        .today {
            font-weight: bold;
            color: red;
        }

        .selected {
            font-weight: bold;
            background: #666;
            color: white;
        }
    </style>

    <div class="container">
        <input type="text" id="input-date">

        <div id="dropdown" class="dropdown hidden">
            <div class="select-year">
                <button id="previous-y">&#60</button>
                <span id="year"></span>
                <button id="next-y">&#62</button>
            </div>

            <div class="select-month">
                <button id="previous-month">&#60</button>
                <div id="month"></div>
                <button id="next-month">&#62</button>
            </div>
                    
            <div class="headers"></div>
            <div class="dates"></div>
        </div>
    </div>
`;

class Datepicker extends HTMLElement {
    constructor() {
        super();

        // open allows the usage of this.shadowRootRoot
        const shadow = this.attachShadow({ mode: "open" });
        const clone = template.content.cloneNode(true);
        shadow.append(clone);

        this._value = null;

        // const that = this;

        this.options = {
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Decemeber"],
            days: ["M", "T", "W", "T", "F", "S", "S"],
        };

        this.container = this.shadowRoot.querySelector(".container");
        this.input = this.shadowRoot.getElementById("input-date");
        this.dropdown = this.shadowRoot.querySelector("#dropdown");

        this.year = this.shadowRoot.getElementById("year");
        this.nextYear = this.shadowRoot.getElementById("next-y");
        this.previousYear = this.shadowRoot.getElementById("previous-y");

        this.month = this.shadowRoot.getElementById("month");
        this.nextMonth = this.shadowRoot.getElementById("next-month");
        this.previousMonth = this.shadowRoot.getElementById("previous-month");

        this.headers = this.shadowRoot.querySelector(".headers");
        this.dates = this.shadowRoot.querySelector(".dates");

        // Initialization
        // Get current year and month
        this.currentDate = new Date();
        this.currentYear = this.currentDate.getFullYear();
        this.currentMonth = this.currentDate.getMonth();
        this.currentDay = this.currentDate.getDate();

        // View values
        this.viewDate = this.currentDate;
        this.viewYear = this.currentYear;
        this.viewMonth = this.currentMonth;
        this.viewDay = this.currentDay;

        // Selected values
        this.selectedDate = this.currentDate;
        this.selectedYear = this.currentYear;
        this.selectedMonth = this.currentMonth;
        this.selectedDay = this.currentDay;

        let today = new Date();
        this.todayDay = today.getDate();
        this.todayMonth = today.getMonth();
        this.todayYear = today.getFullYear();
    }

    connectedCallback() {
        console.log("connected");

        this.headers.innerHTML = this.options.days.map((day) => `<div class="header">${day}</div>`).join("");

        // Displaying the datepicker
        this.input.addEventListener("click", () => {
            let inputDate = this.input.value;

            // If date input is not empty, use the input date, else use current date.
            if (inputDate != "") {
                let inputDateParts = inputDate.split(".");
                let rearrangedParts = `${inputDateParts[1]}.${inputDateParts[0]}.${inputDateParts[2]}`;
                let reformattedDate = new Date(rearrangedParts);

                this.selectedYear = reformattedDate.getFullYear();
                this.selectedMonth = reformattedDate.getMonth();
                this.selectedDay = reformattedDate.getDate();

                this.viewDate = this.selectedDate;
                this.viewYear = this.selectedYear;
                this.viewMonth = this.selectedMonth;
                this.viewDay = this.selectedDay;
            }

            this.renderDatepicker();
        });

        document.addEventListener("click", (event) => {
            const path = event.composedPath();
            if (!path.includes(this.container)) {
                this.dropdown.className = "dropdown hidden";
            }
        });

        this.input.addEventListener("focus", () => {
            this.dropdown.className = "dropdown visible";
        });

        this.nextYear.addEventListener("click", () => {
            this.viewYear += 1;
            this.setYear();
            this.renderDates();
        });

        this.previousYear.addEventListener("click", () => {
            this.viewYear -= 1;
            this.setYear();
            this.renderDates();
        });

        this.nextMonth.addEventListener("click", () => {
            if (this.viewMonth < 11) {
                this.viewMonth += 1;
            } else {
                this.viewYear += 1;
                this.setYear();
                this.viewMonth = 0;
            }
            this.renderDates();
        });

        this.previousMonth.addEventListener("click", () => {
            if (this.viewMonth > 0) {
                this.viewMonth -= 1;
            } else {
                this.viewYear -= 1;
                this.setYear();
                this.viewMonth = 11;
            }
            this.renderDates();
        });
    }

    setYear() {
        this.year.innerHTML = this.viewYear;
    }

    renderDatepicker() {
        this.renderDates();

        this.dropdown.className = "dropdown visible";
        this.year.innerHTML = this.viewYear;
    }

    renderDates() {
        // Set the month text
        this.month.innerHTML = this.options.months[this.viewMonth];

        // Get first and last dates based on year and month.
        let firstDate = new Date(this.viewYear, this.viewMonth, 1);
        let lastDate = new Date(this.viewYear, this.viewMonth + 1, 0);

        // Returns the day of the month (1-31) for the specified date according to local time.
        let lastDay = lastDate.getDate();

        // Returns the day of the week (0-6) for the first date of the month, according to local time.  0 is Sunday, 6 is Saturday.
        // Make Monday the first day, by shifting everything back by one.
        // If Sunday, make Monday. Else, shift day of week back by 1.
        let firstDateDayOfWeekOffset = firstDate.getDay() === 0 ? 6 : firstDate.getDay() - 1; // 0 is Monday, 6 is Sunday.

        let days = [];

        // Add empty dates to align day to day of week.
        for (let i = firstDateDayOfWeekOffset; i > 0; i--) {
            days.push("");
        }

        let day = 1;

        while (day <= lastDay) {
            days.push(day);
            day++;
        }

        this.dates.innerHTML = days
            .map((day) => {
                let isActive = this.viewYear === this.selectedYear && this.viewMonth === this.selectedMonth && this.selectedDay === this.dayCount;
                let isToday = this.viewYear === this.todayYear && this.viewMonth === this.todayMonth && this.todayDay === day;
                let isSelected = this.viewYear === this.selectedYear && this.viewMonth === this.selectedMonth && this.selectedDay === day;

                return `
                    <div 
                        class="${day ? "cell" : ""} ${isActive ? "active" : ""} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}" 
                        data-value="${day}"
                    >
                        ${day}
                    </div>
                `;
            })
            .join("");

        this.shadowRoot.querySelectorAll(".cell").forEach((cell) => {
            cell.addEventListener("click", this.setDate.bind(this));
        });
    }

    setDate(e) {
        let day = e.target.innerText;
        this.selectedDay = day;

        day = day.toString().padStart(2, "0");
        let month = (this.viewMonth + 1).toString().padStart(2, "0");

        this.input.value = `${day}.${month}.${this.viewYear}`;
        this.dropdown.className = "dropdown hidden";

        this._value = `${this.viewYear}-${month}-${day}`;
    }

    static get observedAttributes() {
        return ["input-style", "date"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "input-style") {
            this.input.style.cssText = newValue;
        }

        // if (name == "date") {
        //     this.input.value = newValue;
        //     this._value = newValue;
        // }
    }

    get value() {
        return this._value;
    }

    set value(value) {
        const [year, month, day] = value.split("-");

        this._value = value;
        this.input.value = `${day}.${month}.${year}`;
    }

    disconnectedCallback() {
        console.log("disconnected");
    }
}

customElements.define("date-picker", Datepicker);
