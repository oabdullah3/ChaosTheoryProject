import React from 'react';

const TagForm = ({ 
    selectedAddress, 
    tagInput, 
    setTagInput, 
    onSubmit, 
    onCancel, 
    error 
}) => (
    <div className="tag-form">
        <h3>Add Tag for Address: {selectedAddress}</h3>
        <form onSubmit={onSubmit}>
            <input
                type="text"
                placeholder="Enter a tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="tag-input"
            />
            <div className="form-buttons">
                <button type="submit">Submit Tag</button>
                <button type="button" onClick={onCancel}>Cancel</button>
            </div>
            {error && <p className="error">{error}</p>}
        </form>
    </div>
);

export default TagForm;