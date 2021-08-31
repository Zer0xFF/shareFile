import React, { useState } from 'react';
import ReactDOM from 'react-dom';

function FileListing()
{
    const [files, setFiles] = useState({isLoaded: false, items: []});

    function requestData(url, state, stateSetter)
    {
        if(!state.isLoaded)
        {
            stateSetter({isLoaded: true, items: state.items});
            fetch(url)
                .then(res => res.json())
                .then(
                    (result) => {
                        stateSetter({isLoaded: true, items: result});
                    },
                    (error) => {
                        console.log(error);
                        stateSetter({isLoaded: false, items: state.items});
                    }
                )
        }
    }

    requestData('/api/files', files, setFiles);

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <ul>
                        {files.items.map((file) =>
                            <li><a href={ file.path }> { file.name } </a></li>
                        )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FileListing;

if(document.getElementById('root'))
{
    ReactDOM.render(<FileListing />, document.getElementById('root'));
}
