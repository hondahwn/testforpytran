$(document).ready(function () {
    var mode = "";
    var carmatch = 0;
    $(".closes").click(function(){
        $("#exampleModal").modal("toggle");  
    })

    $(".close2").click(function(){
        $("#exampleModal2").modal("toggle");  
    })

    $(".btnDelete").click(function () {
        carmatch = $(this).attr("blogID");
        $("#exampleModal2").modal("toggle");
    })

    $("#btnModalSave").click(function () {
        // close modal
        $("#exampleModal").modal("toggle");

        // add       
        let data = {
            name: $("#name").val(),
            lastname: $("#lastname").val(),
            License_plate: $("#carplate").val(),
           

        };
        let method = "POST";
        let url = "/addcarmatch";

        // edit
        if (mode == "edit") {
            data = {
                name: $("#name").val(),
                lastname: $("#lastname").val(),
                License_plate: $("#carplate").val(),
                carmatch:carmatch
            };
            method = "PUT";
            url = "/updatecarmatch";
        }

        $.ajax({
            type: method,
            url: url,
            data: data,
            success: function (response) {
                alert("Success")
                window.location.replace(response);
            },
            error: function (xhr) {
                Swal.fire({
                    icon: "error",
                    title: xhr.responseText,
                });
            }
        });
    });

    $("#adduser").click(function () {
        $("#btnModalSave").html("ADD")
        mode = "add";
        // change the modal title
        // change the modal title
        $("#exampleModalLabel").text("Add Carmatch");
        // console.log(postData);
        $("#name").val('');
        $("#lastnamel").val('');
        $("#carplate").val('');
        // show modal
        $("#exampleModal").modal("toggle");

    });

    // Edit button
    $(".btnEdit").click(function () {
        $("#btnModalSave").html("EDIT")
        mode = "edit";
        // change the modal title
        $("#exampleModalLabel").text("Edit match");
        // show modal
        $("#exampleModal").modal("toggle");
        // get selected post data
        const postData = JSON.parse($(this).attr("blogData"));
         console.log(postData);
        $("#name").val(postData.name);
        $("#lastname").val(postData.lastname);
        $("#carplate").val(postData.License_plate);
        carmatch = postData.carmatch;
        
    });

    $("#deletekiki").click(function () {
        $.ajax({
            type: "DELETE",
            url: "/deletecarmatch" ,
            data: { carmatch: carmatch },
        }).done(function (data, state, xhr) {
            alert("delete success")
                window.location.replace(data)
        })
    })

});

