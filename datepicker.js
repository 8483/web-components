const template = document.createElement("template");

template.innerHTML = `
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10pt;
        }

        .container {
            position: relative;
        }

        input {
        }

        .dropdown {
            position: absolute;
            top: 23px;
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
        #month-title {
            text-align: center;
        }

        #date-table td,
        #date-table th {
            padding: 5px;
        }

        /* Refactor into .cell .cell-active */
        .cell {
            text-align: center;
            background: #fff;
            border-radius: 2px;
            border-width: 5px;
        }

        .cell-active {
            text-align: center;
            background: #ccc;
        }

        button {
            background: #ccc;
            border: none;
            border-radius: 2px;
            cursor: pointer;
        }
    </style>

    <div class="container">
        <input type="text" id="input-date">
        <div id="dropdown" class="dropdown hidden"></div>
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

        const that = this;

        let options = {
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Decemeber"],
            days: ["M", "T", "W", "T", "F", "S", "S"],
        };

        // TODO:
        // Make the datepicker Object Oriented
        // Make the date a single HTML tag, by puttin everything in JS
        // Select date with manual keyboard input
        // Today button

        // Initialization
        // Get current year and month
        let currentDate = new Date();
        let currentYear = currentDate.getFullYear();
        let currentMonth = currentDate.getMonth();
        let currentDay = currentDate.getDate();

        // View values
        let viewDate = currentDate;
        let viewYear = currentYear;
        let viewMonth = currentMonth;
        let viewDay = currentDay;

        // Selected values
        let selectedDate = currentDate;
        let selectedYear = currentYear;
        let selectedMonth = currentMonth;
        let selectedDay = currentDay;

        // Displaying the datepicker
        shadow.getElementById("input-date").addEventListener("click", () => {
            let inputDate = shadow.getElementById("input-date").value;
            // If date input is not empty, use the input date, else use current date.
            if (inputDate != "") {
                let inputDateParts = inputDate.split(".");
                let rearrangedParts = `${inputDateParts[1]}.${inputDateParts[0]}.${inputDateParts[2]}`;
                let reformattedDate = new Date(rearrangedParts);

                selectedYear = reformattedDate.getFullYear();
                selectedMonth = reformattedDate.getMonth();
                selectedDay = reformattedDate.getDate();

                viewDate = selectedDate;
                viewYear = selectedYear;
                viewMonth = selectedMonth;
                viewDay = selectedDay;
            }

            renderDatepicker();
        });

        document.addEventListener("click", (event) => {
            const container = shadow.querySelector(".container");
            const dropdown = shadow.querySelector("#dropdown");

            const path = event.composedPath();

            if (!path.includes(container)) {
                dropdown.className = "dropdown hidden";
            }
        });

        shadow.querySelector("#input-date").addEventListener("focus", () => {
            const dropdown = shadow.querySelector("#dropdown");
            dropdown.className = "dropdown visible";
        });

        function renderDatepicker() {
            shadow.getElementById("dropdown").innerHTML = "";

            shadow.getElementById("dropdown").innerHTML = `
                <div class="select-year">
                    <button id="prev-y">&#60</button>
                    <span id="year"></span>
                    <button id="next-y">&#62</button>
                </div>
                <div class="select-month">
                    <button id="prev-month">&#60</button>
                    <div id="month-title"></div>
                    <button id="next-month">&#62</button>
                </div>
                        
                <table id="date-table"></table>
            `;

            getDays();

            shadow.getElementById("dropdown").className = "dropdown visible";
            shadow.getElementById("year").innerHTML = viewYear;

            shadow.getElementById("next-y").addEventListener("click", () => {
                viewYear += 1;
                setYear();
                getDays();
            });

            shadow.getElementById("prev-y").addEventListener("click", () => {
                viewYear -= 1;
                setYear();
                getDays();
            });

            shadow.getElementById("next-month").addEventListener("click", () => {
                if (viewMonth < 11) {
                    viewMonth += 1;
                } else {
                    viewYear += 1;
                    setYear();
                    viewMonth = 0;
                }
                getDays();
            });

            shadow.getElementById("prev-month").addEventListener("click", () => {
                if (viewMonth > 0) {
                    viewMonth -= 1;
                } else {
                    viewYear -= 1;
                    setYear();
                    viewMonth = 11;
                }
                getDays();
            });

            function setYear() {
                shadow.getElementById("year").innerHTML = viewYear;
            }

            function getDays() {
                shadow.getElementById("date-table").innerHTML = "";

                // Set the month text
                shadow.getElementById("month-title").innerHTML = options.months[viewMonth];

                let headers = "";
                options.days.map((day) => {
                    headers += `<th>${day}</th>`;
                });
                let thead = `<thead>${headers}</thead>`;

                // Get first and last dates based on year and month.
                let firstDate = new Date(viewYear, viewMonth, 1);
                let lastDate = new Date(viewYear, viewMonth + 1, 0);

                // Returns the day of the month (1-31) for the specified date according to local time.
                let lastDay = lastDate.getDate();

                // Returns the day of the week (0-6) for the specified date according to local time.
                // let offset = firstDate.getDay(); // 0 is Sunday, 6 is Saturday.

                // Make Monday the first day, by shifting everything back by one.
                let offset = firstDate.getDay() === 0 ? 6 : firstDate.getDay() - 1; // 0 is Monday, 6 is Sunday.

                let dayCount = 1;
                let rows = "";
                for (let i = 0; i < 6; i++) {
                    if (dayCount <= lastDay) {
                        // Prevent extra row with the last day
                        let cells = "";
                        for (let j = 0; j < 7; j++) {
                            if (offset == 0) {
                                let cellClass = "";
                                if (viewYear === selectedYear && viewMonth === selectedMonth && selectedDay === dayCount) {
                                    cellClass = "cell-active";
                                } else {
                                    cellClass = "cell";
                                }

                                // Prevent making extra days like January 32nd for the last row.
                                if (dayCount <= lastDay) {
                                    cells += `<td class=${cellClass} data-value="${dayCount}">${dayCount}</td>`;
                                    dayCount++;
                                }
                            } else {
                                // Make empty cells until matching day reached.
                                cells += `<td></td>`;
                                offset--;
                            }
                        }
                        rows += `<tr id="row-${i}">${cells}</tr>`;
                    }
                }

                let tbody = `<tbody>${rows}</tbody>`;

                shadow.getElementById("date-table").innerHTML = `${thead}${tbody}`;

                shadow.querySelectorAll(".cell, .cell-active").forEach((cell) => {
                    cell.addEventListener("click", setDate);
                });
            }
        }

        function setDate(e) {
            let day = e.target.innerText;
            selectedDay = day;

            day = day.toString().padStart(2, "0");
            let month = (viewMonth + 1).toString().padStart(2, "0");

            shadow.getElementById("input-date").value = `${day}.${month}.${viewYear}`;
            shadow.getElementById("dropdown").className = "dropdown hidden";

            that._value = `${viewYear}-${month}-${day}`;
        }
    }

    connectedCallback() {
        console.log("connected");
    }

    static get observedAttributes() {
        return ["input-style", "date"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "input-style") {
            this.shadowRoot.getElementById("input-date").style.cssText = newValue;
        }

        // if (name == "date") {
        //     this.shadowRoot.getElementById("input-date").value = newValue;
        //     this._value = newValue;
        // }
    }

    get value() {
        return this._value;
    }

    set value(value) {
        const [year, month, day] = value.split("-");

        this._value = value;
        this.shadowRoot.getElementById("input-date").value = `${day}.${month}.${year}`;
    }

    disconnectedCallback() {
        console.log("disconnected");
    }
}

customElements.define("date-picker", Datepicker);
