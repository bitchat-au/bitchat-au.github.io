radioChannel = 1  # all microbits in a group should be on the same radio channel

# Imports go at the top
from microbit import *
import machine
import struct
import radio
import random
import music
import time

id_number = "0"
device_name = ""
message_number = 0
recipient_index = 0
known_recipients = 0
known_recipient_list = []
encryptable = False
auto_encryptable = False
allow_recipient = False
output_message = []
wrong_message = False
pitch_list = [6, 8, 10, 12]
last_recorded_message = 0
reset_microbit_time = False


def show_inner_dot_animation():
    frames = [
        "00000:09000:00000:00000:00000",
        "00000:00900:00000:00000:00000",
        "00000:00090:00000:00000:00000",
        "00000:00000:00090:00000:00000",
        "00000:00000:00000:00090:00000",
        "00000:00000:00000:00900:00000",
        "00000:00000:00000:09000:00000",
        "00000:00000:09000:00000:00000",
    ]

    frame = time.ticks_ms() // 120 % len(frames)
    display.show(Image(frames[frame]))

led_images = [
    [
        [0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
    ],
    [
        [0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
    ],
]

send_images = [
    [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0],
    ],
    [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
    ],
    [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [1, 0, 1, 0, 1],
    ],
    [
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [1, 0, 1, 0, 1],
        [0, 0, 1, 0, 0],
    ],
    [
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [1, 0, 1, 0, 1],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
    ],
    [
        [0, 1, 1, 1, 0],
        [1, 0, 1, 0, 1],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0],
    ],
    [
        [1, 0, 1, 0, 1],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
    ],
    [
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
    ],
    [
        [0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
    ],
]

###################################################
## Received message structure
###################################################
message_construct_index = [False, False, False, False, False]
message_construct = ["", "", "", "", ""]
message_complete = False
message_sender = 0
message_recipient = ""
code_string = ""
packed_received_image = ""

###################################################
## micro:bit states:
###################################################
known = False
last_known_ping = 0
choosing_content = False
choosing_recipient = False
encrypting_message = False
sending_message = False
ready_to_send = False
code = []
should_beep = False

###################################################
## Setup for the radio:
###################################################
radio.config(group=radioChannel, data_rate=radio.RATE_1MBIT, queue=10, channel=42)
radio.on()


###################################################
## Setup for actual ID
###################################################
def microbit_friendly_name():
    """Generates a friendly name for the micro:bit based on its unique ID."""
    length = 5
    letters = 5
    codebook = [
        ["z", "v", "g", "p", "t"],
        ["u", "o", "i", "e", "a"],
        ["z", "v", "g", "p", "t"],
        ["u", "o", "i", "e", "a"],
        ["z", "v", "g", "p", "t"],
    ]
    name = []

    # Derive our name from the nrf51822's unique ID
    _, n = struct.unpack("II", machine.unique_id())
    ld = 1
    d = letters

    for i in range(0, length):
        h = (n % d) // ld
        n -= h
        d *= letters
        ld *= letters
        name.insert(0, codebook[i][h])

    return "".join(name)


device_name = str(microbit_friendly_name())

###################################################
## Assisting functions
###################################################


# Function to produce the correct message format with id
def send_message(message_to_send):
    """Sends a message over the radio with the micro:bit's ID prepended."""
    radio.send(device_name + "_" + str(message_to_send))


def set_image(image_index, image_list):
    """Returns the image at the specified index from the provided list of images."""
    image_string = ""
    for i in range(5):
        for j in range(5):
            if image_list == output_message:
                image_string = image_string + str(image_list[i][j] * 9)
            else:
                image_string = image_string + str(image_list[image_index][i][j] * 9)
        if i is not 4:
            image_string = image_string + ":"
    return image_string


def matrix_to_image(matrix):
    """Converts a 5x5 matrix into a string format suitable for display."""
    rows = ["".join(str(int(x) * 9) for x in row) for row in matrix]
    return ":".join(rows)


def set_recipients():
    """Generates a list of known recipient IDs, excluding the micro:bit's own ID."""
    global known_recipient_list

    known_recipient_list = []
    for i in range(known_recipients):
        if i is not int(id_number):
            known_recipient_list.append(i)
    return known_recipient_list


def send_animation():
    """Displays a sending animation on the micro:bit's LED matrix."""
    for i in range(len(send_images)):
        display.show(Image(set_image(i, send_images)))
        sleep(100)
    display.clear()
    sleep(100)


def create_encryption(message_list):
    """Applies the encryption code to the message list, flipping bits as specified."""
    for j in range(5):  # Kolonne
        if int(code[j]) > 0:  # hvis koden siger jeg skal flippe
            for k in range(5):  # række
                if message_list[k][j] > 0:
                    message_list[k][j] = 0
                else:
                    message_list[k][j] = 1
    return message_list


def encrypt_image(image_list):
    """Displays the encrypted image on the micro:bit's LED matrix."""
    sleep(500)
    for j in range(5):  # Kolonne
        for l in range(5):
            display.set_pixel(j, l, 0)
        for k in range(5):  # række
            led_strength = int(image_list[k][j])
            if led_strength < 9:
                led_strength = led_strength * 9
            display.set_pixel(j, k, led_strength)
        sleep(500)


def pack_image(matrix):
    """Converts a 5x5 matrix into a 5-char alphanumeric string (A-Z, 0-5)."""
    return "".join(
        chr(v + 65) if v <= 25 else str(v - 26)
        for v in (int("".join(map(str, row)), 2) for row in matrix)
    )


def unpack_image(payload):
    """Converts a 5-char alphanumeric string back into a 5x5 matrix."""
    return [
        [
            int(bit)
            for bit in "{:05b}".format(int(c) + 26 if c.isdigit() else ord(c) - 65)
        ]
        for c in payload
    ]


def check_radio():
    global output_message, code_string, ready_to_send, encrypting_message, choosing_content

    radio_message = radio.receive()
    if radio_message:
        if device_name in radio_message:
            display.clear()
            display.show(int(id_number) + 1)
            output_message = []
            code_string = ""

            # Reset states
            ready_to_send = False
            encrypting_message = False
            choosing_content = False

        if (
            "settings" in radio_message
            or "known" in radio_message
            or "newImg" in radio_message
        ):
            machine.reset()


###################################################
## Loop
###################################################
# Code in a 'while True:' loop repeats forever
while True:
    # Listen for radio input
    message = radio.receive()
    if message:
        if device_name in message:
            known = True
            if "number" in message:
                id_number = message.split("_")[2]
                known_recipients = int(message.split("_")[3])
                display.show(int(id_number) + 1)
            if "receive" in message:
                messageComponents = message.split("_")

                packed_received_image = str(messageComponents[2])
                message_sender = int(messageComponents[3])
                code_string = messageComponents[4] if encryptable else ""

                message_complete = True
            if "repeat" in message:
                repeat_index = int(message.split("_")[2])
                send_message(
                    "send_"
                    + message_recipient
                    + "_"
                    + str(repeat_index)
                    + "_"
                    + message_construct[repeat_index]
                    + ("_" + code_string if encryptable else "")
                )
            if "wrong" in message:
                wrong_message = True
        if "reintroduce" in message:
            known = False
            last_known_ping = time.ticks_ms() - (
                (10 - int(id_number)) * 100
            )  # Offset the time so that the micro:bits don't all respond at once, and so that the micro:bits with the lowest id respond first
            id_number = "0"
            display.clear()
        if "known" in message:
            known_recipients = int(message.split("_")[1])
        if "newImg" in message:

            imageIndex = (
                int(message.split("_")[1]) + 2
            )  # +2 is the offset for the two default images
            packedNewImage = message.split("_")[2]

            led_images.append(unpack_image(packedNewImage))
        if "settings" in message:
            encryptable = message.split("_")[1] == "1"
            auto_encryptable = message.split("_")[2] == "1"
            allow_recipient = message.split("_")[3] == "1"
            should_beep = message.split("_")[4] == "1"

        if "complete" in message:
            output_message = [[], [], [], [], []]
        if "receive" in message and not allow_recipient:
            messageComponents = message.split("_")

            packed_received_image = str(messageComponents[2])
            message_sender = int(messageComponents[3])

            if encryptable:
                code_string = messageComponents[4]

            if message_sender != int(id_number):
                message_complete = True

    # When a full message has been received
    if message_complete:
        if should_beep:
            for i, pitch in enumerate(pitch_list):
                if wrong_message:
                    music.pitch(pitch_list[(len(pitch_list) - 1) - i] * 100)
                else:
                    music.pitch(pitch * 100)
                sleep(150)
            music.stop()

        output_message = unpack_image(packed_received_image)
        code = list(code_string)

        display.show(Image(matrix_to_image(output_message)))

        sleep(
            int(id_number) * 50
        )  # Offset the time so that the micro:bits don't all respond at once, and so that the micro:bits with the lowest id respond first
        send_message("complete")

        if encryptable:
            inputPress = 0
            analysisInProgress = True
            if auto_encryptable:
                analysisInProgress = False
            correctInput = True
            while analysisInProgress:
                a_pressed = button_a.was_pressed()
                b_pressed = button_b.was_pressed()

                if a_pressed and int(code[inputPress]) > 1:
                    correctInput = False
                    analysisInProgress = False

                if b_pressed and int(code[inputPress]) < 1:
                    correctInput = False
                    analysisInProgress = False

                if a_pressed or b_pressed:
                    display.show("A" if a_pressed else "B")
                    sleep(500)
                    display.clear()

                    inputPress += 1
                    for i in range(inputPress):
                        if int(code[i]) > 0:
                            for j in range(5):
                                display.set_pixel(i, j, 9)
                        else:
                            display.set_pixel(i, 2, 9)

                if inputPress > 4:
                    analysisInProgress = False

            if correctInput:
                output_message = create_encryption(output_message)
                encrypt_image(output_message)
                sleep(4000)
                display.show(Image.ARROW_W)
                sleep(1000)
                display.show(int(message_sender) + 1)
                reset_microbit_time = True
            else:
                display.clear()
                display.show(Image.NO)
                sleep(2000)
                reset_microbit_time = True
        else:
            sleep(4000)
            display.show(Image.ARROW_W)
            sleep(1000)
            display.show(int(message_sender) + 1)
            reset_microbit_time = True

    if reset_microbit_time:
        sleep(2000)
        display.clear()
        display.show(int(id_number) + 1)
        output_message = []
        code = []
        wrong_message = False
        code_string = ""
        message_sender = 0
        packed_received_image = []
        message_complete = False
        last_recorded_message = time.ticks_ms()
        reset_microbit_time = False

    if not known and time.ticks_ms() - last_known_ping > 1000:
        send_message("hello")
        last_known_ping = time.ticks_ms()

    if not known:
        show_inner_dot_animation()
        continue;

    # When starting a new message
    if pin_logo.is_touched():
        output_message = []
        code = []
        display.show(
            Image("99999:" "99099:" "90909:" "90009:" "99999")
        )  # show envelope image
        sleep(1000)
        display.show(Image(set_image(0, led_images)))
        choosing_content = True

    while choosing_content:
        check_radio()

        if button_a.was_pressed():
            message_number -= 1

            if message_number < 0:
                message_number = len(led_images) - 1

            display.show(Image(set_image(message_number, led_images)))
            print(message_number)

        if button_b.was_pressed():
            message_number += 1
            if message_number > len(led_images) - 1:
                message_number = 0

            display.show(Image(set_image(message_number, led_images)))
            print(message_number)

        if pin_logo.is_touched():
            output_message = [[], [], [], [], []]
            for i in range(5):
                for j in range(5):
                    output_message[i].append(led_images[message_number][i][j])
            if encryptable:
                display.show(Image("00000:" "09000:" "90999:" "09009:" "00000"))
                sleep(1000)
                display.clear()
                encrypting_message = True
                choosing_content = False
            elif allow_recipient:
                display.show(Image.ARROW_E)
                sleep(1000)
                known_recipient_list = set_recipients()
                display.show(known_recipient_list[0] + 1)
                choosing_recipient = True
                choosing_content = False
            else:
                sending_message = True
                choosing_content = False

    while encrypting_message:
        check_radio()

        if button_a.was_pressed():
            if len(code) < 1:
                display.clear()
            display.clear()
            display.show("A")
            sleep(500)
            display.clear()
            code.append("0")
            for i, char in enumerate(code):
                if int(char) > 0:
                    for j in range(5):
                        display.set_pixel(i, j, 9)
                else:
                    display.set_pixel(i, 2, 9)

        if button_b.was_pressed():
            if len(code) < 1:
                display.clear()
            display.clear()
            display.show("B")
            sleep(500)
            display.clear()
            code.append("1")
            for i, char in enumerate(code):
                if int(char) > 0:
                    for j in range(5):
                        display.set_pixel(i, j, 9)
                else:
                    display.set_pixel(i, 2, 9)

        if auto_encryptable:
            for i in range(5):
                code.append(str(random.randint(0, 1)))

        if len(code) > 4:
            display.clear()
            for i in range(3):
                for j in range(5):
                    for k in range(5):
                        if random.randint(0, 1) > 0:
                            display.set_pixel(k, j, 9)
                        else:
                            display.set_pixel(k, j, 0)
                sleep(500)
            output_message = create_encryption(output_message)
            display.clear()
            display.show(Image(set_image(message_number, led_images)))
            encrypt_image(output_message)
            code_string = ""
            for i in range(5):
                code_string += code[i]
            code = []
            ready_to_send = True

            while ready_to_send:
                check_radio()

                if pin_logo.is_touched():
                    display.show(Image.ARROW_E)
                    sleep(1000)
                    if allow_recipient:
                        known_recipient_list = set_recipients()
                        display.show(known_recipient_list[0] + 1)
                        choosing_recipient = True
                    else:
                        sending_message = True
                    encrypting_message = False
                    ready_to_send = False

    while choosing_recipient:
        check_radio()

        if button_a.was_pressed():
            recipient_index -= 1

            if recipient_index < 0:
                recipient_index = len(known_recipient_list) - 1

            display.show(known_recipient_list[recipient_index] + 1)

        if button_b.was_pressed():
            recipient_index += 1
            if recipient_index > len(known_recipient_list) - 1:
                recipient_index = 0

            display.show(known_recipient_list[recipient_index] + 1)

        if pin_logo.is_touched():
            sending_message = True
            choosing_recipient = False

    while sending_message:
        send_animation()
        sleep(500)

        message_recipient = (
            str(known_recipient_list[recipient_index]) if allow_recipient else "-1"
        )
        send_message(
            "send_"
            + message_recipient
            + "_"
            + str(pack_image(output_message))
            + ("_" + code_string if encryptable else "")
        )

        recipient_index = 0
        message_number = 0
        display.show(int(id_number) + 1)
        sending_message = False
