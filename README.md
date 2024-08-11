```html
<!DOCTYPE html>
<html>
    <head>
        <script src="datepicker.js"></script>
    </head>

    <body>
        <!-- <date-picker input-style="background: blue; width: 200px;" date="foo"></date-picker> -->
        <date-picker></date-picker>

        <button id="button">get date</button>

        <script>
            document.getElementById("button").addEventListener("click", (e) => {
                let datepicker = document.querySelector("date-picker");

                console.log(datepicker.value);
            });
        </script>
    </body>
</html>
```

[DEMO](https://jsbin.com/loqadatoji/edit?html,js,console,output)
