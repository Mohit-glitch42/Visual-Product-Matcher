2201641720064_Mohit Singh-Visual-Project-Matcher Build-Assignment4
This project is a full-stack web application that allows users to find visually similar products by uploading an image or providing an image URL. It was built as a technical assessment for a Software Engineer position.

Live Application URL: https://www.google.com/search?q=https://2201641720064-mohit-singh-assignment4.onrender.com

Features
Dual Image Input: Supports both direct file uploads and searching via image URL.

Image Preview: Displays the user's uploaded image for clear reference.

Similarity Results: Shows a ranked list of the most visually similar products from the database.

Similarity Score Filter: A slider allows users to filter results based on a minimum similarity score.

Responsive Design: The interface is fully responsive and optimized for both desktop and mobile use.

User Experience: Includes loading states to inform the user when processing is underway and handles errors gracefully.

Technical Approach
My approach was to create a robust and efficient system by decoupling the frontend and backend and leveraging pre-trained machine learning models for image analysis.

Frontend: The frontend is a React single-page application built with Create React App. It provides a clean, user-friendly interface and manages all user interactions and API calls.

Backend: The backend is a Node.js server using the Express framework. It exposes a single API endpoint (/api/search) that handles the core logic of image processing and similarity matching.

Image Embeddings: The core of the visual search lies in converting images into numerical representations called embeddings (or feature vectors). For this, I used TensorFlow.js with the pre-trained MobileNet model. MobileNet was chosen for its excellent balance of speed and accuracy in a server-side JavaScript environment.

Data Pipeline: To ensure fast search results, I used a two-phase process:

Offline Processing: A script (scripts/generate_embeddings.js) is run once to pre-process the entire product database. It generates an embedding for each product image and saves this data into a products_with_embeddings.json file.

Real-time Processing: When a user provides an image, the server generates an embedding for only that new image in real-time.

Similarity Calculation: The server compares the user's image embedding to all the pre-calculated embeddings in the database using Cosine Similarity. This mathematical function measures the "angle" between two vectors, providing an accurate score of how similar they are. The results are then ranked and sent to the frontend.

How to Run Locally
Prerequisites:

Node.js (v18 or later)

npm

Backend Setup:

# Navigate to the backend directory

cd backend

# Install dependencies

npm install

# IMPORTANT: Run the one-time script to generate the data file

node scripts/generate_embeddings.js

# Start the server

npm start

# The server will be running on http://localhost:8000

Frontend Setup:

# Navigate to the frontend directory

cd frontend

# Install dependencies

npm install

# Start the React development server

npm start

# The application will open on http://localhost:3000
