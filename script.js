document.addEventListener("DOMContentLoaded", function () {
  const dateSelect = document.getElementById("date");
  let lineChart, barChart;

  // Function to fetch data and update the charts and cards
  function updateDashboard(dateRange) {
    fetch("mockData.json")
      .then((response) => response.json())
      .then((data) => {
        const summary = data.summaryCards;
        const dateRangeData = data.dateRangeData[dateRange];

        // Ensure the selected date range exists
        const activityLogs = dateRangeData
          ? dateRangeData.userActivityLogs
          : [];

        const logsPerPage = 5;
        let currentPage = 1;

        // Update summary cards
        document.getElementById("totalUsers").textContent = summary.totalUsers;
        document.getElementById("activeSessions").textContent =
          summary.activeSessions;
        document.getElementById("revenue").textContent =
          "$" + summary.revenue.toLocaleString();
        document.getElementById("conversionRate").textContent =
          summary.conversionRate + "%";

        // Update charts
        const lineChartData = dateRangeData.lineChartData.map(
          (item) => item.performance
        );
        const lineChartLabels = dateRangeData.lineChartData.map(
          (item) => item.date
        );

        const barChartData = dateRangeData.barChartData.map(
          (item) => item.sales
        );
        const barChartLabels = dateRangeData.barChartData.map(
          (item) => item.category
        );

        // Update or create the Line Chart
        if (lineChart) {
          lineChart.data.labels = lineChartLabels;
          lineChart.data.datasets[0].data = lineChartData;
          lineChart.update();
        } else {
          lineChart = new Chart(document.getElementById("lineChart"), {
            type: "line",
            data: {
              labels: lineChartLabels,
              datasets: [
                {
                  label: "Performance",
                  data: lineChartData,
                  borderColor: "rgba(75, 192, 192, 1)",
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                  borderWidth: 2,
                  fill: true,
                },
              ],
            },
            options: {
              responsive: true,
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "Date",
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: "Performance",
                  },
                },
              },
            },
          });
        }

        // Update or create the Bar Chart
        if (barChart) {
          barChart.data.labels = barChartLabels;
          barChart.data.datasets[0].data = barChartData;
          barChart.update();
        } else {
          barChart = new Chart(document.getElementById("barChart"), {
            type: "bar",
            data: {
              labels: barChartLabels,
              datasets: [
                {
                  label: "Sales",
                  data: barChartData,
                  backgroundColor: "rgba(153, 102, 255, 0.2)",
                  borderColor: "rgba(153, 102, 255, 1)",
                  borderWidth: 2,
                },
              ],
            },
            options: {
              responsive: true,
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "Category",
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: "Sales",
                  },
                },
              },
            },
          });
        }

        // Function to render the activity table
        function renderTable(logs, page = 1) {
          const start = (page - 1) * logsPerPage;
          const end = page * logsPerPage;
          const logsToDisplay = logs.slice(start, end);

          const tableBody = document.querySelector("#activityTable tbody");
          tableBody.innerHTML = ""; // Clear existing rows

          if (logsToDisplay.length === 0) {
            tableBody.innerHTML =
              '<tr><td colspan="3">No activity logs available for this date range.</td></tr>';
          }
          // Loop through logs and render each row
          logsToDisplay.forEach((log) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${log.name}</td><td>${log.action}</td><td>${log.timestamp}</td>`;
            tableBody.appendChild(row);
          });
        }

        // Function to create pagination links
        function renderPagination(logs, currentPage) {
          const paginationNav = document.querySelector("#paginationNav ul");
          paginationNav.innerHTML = ""; // Clear existing links

          const totalPages = Math.ceil(logs.length / logsPerPage);

          for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement("li");
            pageLink.className = `page-item ${
              i === currentPage ? "active" : ""
            }`;
            pageLink.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageLink.addEventListener("click", (e) => {
              e.preventDefault();
              currentPage = i;
              renderTable(logs, currentPage);
              renderPagination(logs, currentPage);
            });
            paginationNav.appendChild(pageLink);
          }
        }

        // Event listener for the export button
        document
          .getElementById("exportBtn")
          .addEventListener("click", () => exportCSV(activityLogs));

        // Initial render
        renderTable(activityLogs, currentPage);
        renderPagination(activityLogs, currentPage);
      })
      .catch((error) => console.error("Error fetching mock data:", error));
  }

  // Function to export activity logs to CSV
  function exportCSV(logs) {
    const header = ["Name", "Action", "Timestamp"];
    const rows = logs.map((log) => [log.name, log.action, log.timestamp]);

    // Create CSV content
    const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n");

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Create a download link for the CSV file
    const link = document.createElement("a");
    if (link.download !== undefined) {
      // Ensure download attribute is supported
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "user_activity_logs.csv");
      link.style.visibility = "hidden"; // Hide the link
      document.body.appendChild(link);
      link.click(); // Trigger the download
      document.body.removeChild(link); // Clean up
    }
  }

  // Initial load
  updateDashboard(dateSelect.value);

  // Update charts when the date range changes
  dateSelect.addEventListener("change", function () {
    updateDashboard(this.value);
  });
});
