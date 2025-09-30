from dotenv import load_dotenv
import streamlit as st
import google.generativeai as genai
import os
from PIL import Image
load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

## function to load Gemini Pro Model and get Responses

model = genai.GenerativeModel("models/gemma-3-27b-it")
def get_response(input,image):
    if input!="":
        response = model.generate_content([input,image])
    else:
        response = model.generate_content(image)
    return response.text

st.header("Gemini Application")
input=st.text_input("Input Prompt:",key="input")
upload_image=st.file_uploader("Upload Image:",type=["jpg","jpeg","png"])
image=""
if upload_image is not None:
    image=Image.open(upload_image)
    st.image(image,caption="Uploaded Image",use_column_width=True)


submit=st.button("Tell me about the image")

## if submit button is clicked
if submit:
    response=get_response(input,image)
    st.subheader("The Response is")
    st.write(response)