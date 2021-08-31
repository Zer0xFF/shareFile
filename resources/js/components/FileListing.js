import React, { useState } from 'react';
import ReactDOM from 'react-dom';

function FileListing()
{
    const [files, setFiles] = useState(['ss/PLACEHOLDER']);


    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <ul>
                        {files.map((file) =>
                            <li><a href={ file }> { file } </a></li>
                        )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FileListing;

if (document.getElementById('root')) {
    ReactDOM.render(<FileListing />, document.getElementById('root'));
}
