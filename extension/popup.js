document.addEventListener("DOMContentLoaded", function () {
    // Get the current tab's URL and set it in the URL input field
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var urlInput = document.getElementById("url");
        urlInput.value = tabs[0].url;
    });

    // Get the highlighted text (title) on the page and set it in the Title input field
    chrome.tabs.executeScript(
        {
            code: "window.getSelection().toString();",
        },
        function (selection) {
            var titleInput = document.getElementById("title");
            titleInput.value = selection[0];
        }
    );

    // Handle form submission (Save button click)
    document.getElementById("saveForm").addEventListener("submit", function (event) {
        event.preventDefault();

        // Gather form data
        var title = document.getElementById("title").value;
        var url = document.getElementById("url").value;
        var type = document.getElementById("type").value;

        // Prepare data for POST request
        var data = {
            title: title,
            url: url,
            type: type,
        };

        // Send the data to the Flask server using AJAX/Fetch
        // You need to replace "http://localhost:5000/save" with your actual server URL
        fetch("http://localhost:5000/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then(function (response) {
                if (response.ok) {
                    // Handle successful response here (optional)
                    console.log("Data saved successfully!");
                } else {
                    // Handle errors here (optional)
                    console.error("Failed to save data.");
                }
            })
            .catch(function (error) {
                // Handle errors here (optional)
                console.error("Error occurred:", error);
            });
    });

    // Function to create the delete link (red cross) for each saved item
    // function createDeleteLink(itemId) {
    //     var deleteLink = document.createElement("span");
    //     deleteLink.className = "delete-link";
    //     deleteLink.textContent = " ❌"; // Red cross (X) icon
    //     deleteLink.addEventListener("click", function () {
    //         // Call the Flask server to delete the item from the database
    //         fetch("http://localhost:5000/delete/" + itemId, {
    //             method: "DELETE",
    //         })
    //             .then(function (response) {
    //                 if (response.ok) {
    //                     // If deletion is successful, fetch and update the saved items list
    //                     fetchLast10SavedItems();
    //                 } else {
    //                     throw new Error("Failed to delete item.");
    //                 }
    //             })
    //             .catch(function (error) {
    //                 console.error(error);
    //             });
    //     });
    //
    //     return deleteLink;
    // }

    // Function to display the saved items in the UI
    function displaySavedItems(savedItems) {
        var savedItemsContainer = document.getElementById("savedItems");
        savedItemsContainer.innerHTML=null;

        var ul = document.createElement("ul");
        savedItems.forEach(function (item) {
            var li = document.createElement("li");

            // Create the type badge with appropriate class
            var typeBadge = document.createElement("span");
            typeBadge.textContent = item.type;
            typeBadge.className = "badge " + item.type;
            li.appendChild(typeBadge);

            // Create the clickable link
            var link = document.createElement("a");
            link.textContent = item.title;
            link.href = item.url;
            link.target = "_blank"; // Open link in a new tab
            li.appendChild(link);

            ul.appendChild(li);
        });

        savedItemsContainer.appendChild(ul);
    }


    // Function to fetch and display the last 10 saved items
    function fetchLast10SavedItems() {
        fetch("http://localhost:5000/last-10-saved")
            .then(function (response) {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Failed to fetch saved items.");
                }
            })
            .then(function (data) {
                displaySavedItems(data);
            })
            .catch(function (error) {
                console.error(error);
            });
    }

    // Fetch and display the last 10 saved items when the pop-up is opened
    fetchLast10SavedItems();
});

