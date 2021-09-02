import React, { useReducer, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

function FileListing()
{
    const [root, setRootDirectory] = useReducer(parseFileRequest, {isLoaded: false, items: [], tree:{}});
    const [navHistory, setNavigation] = useState([])
    const [folderDisplay, navigate] = useReducer(SetCurentFolder, {__DIRS__: [], __FILES__:[]});

    function navigateFolders(history)
    {
        let activeDirectory = root.tree;
        history.forEach(dir => {
            activeDirectory = activeDirectory[dir];
        });
        return activeDirectory;
    }

    function SetCurentFolder(state, action)
    {
        let history = navHistory;
        let activeDirectory = state;
        switch(action.type)
        {
            case 'up':
            {
                history.push(action.folder);
                activeDirectory = activeDirectory[action.folder];
            }
            break;
            case 'back':
            {
                history = navHistory.slice(0, -1);
                activeDirectory = navigateFolders(history);
            }
            break;
            case 'set':
            {
                history = navHistory.slice(0, action.index);
                activeDirectory = navigateFolders(history);
            }
            break;
            case 'root':
            {
                history = [];
                activeDirectory = root.tree;
            }
            break;
        }
        setNavigation(history);
        return activeDirectory;
    }

    function parseFileRequest(_, action)
    {
        let dirs = {__DIRS__:[], __FILES__: []};
        action.items.forEach(file => {
            let dir = file.path.split('/').slice(0, -1);
            let _dirs = dirs;
            dir.forEach(sub => {
                _dirs.__DIRS__.push(sub);
                if(_dirs.hasOwnProperty(sub) == false)
                    _dirs[sub] = {__DIRS__:[], __FILES__: []};
                _dirs = _dirs[sub];
            });
            _dirs.__FILES__.push(file);
        });
        return {isLoaded: action.isLoaded, items: action.items, tree: dirs};
    }

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
                        console.log("requestData:" + url, error);
                        stateSetter({isLoaded: false, items: state.items});
                    }
                )
        }
    }

    useEffect(() =>
    {
        navigate({type: 'root'});
    }, [root]);

    useEffect(() =>
    {
        requestData('/api/files', root, setRootDirectory);
    }, []);

    function generateParentHeader()
    {
        return [<a href={'#' + 0} onClick={() => navigate({type: 'root'})}> / </a>, ...navHistory.map((path, i) =>
        <> <a href={'#' + (i + 1)} onClick={() => navigate({type: 'set', index: i + 1})}> {path} </a> / </>
        )];
    }
    return (
        <div className="container">
            <div className="flex header"></div>
            <div className="flex body row justify-content-center">
                <div className="col-md-10">
                    <h2>{generateParentHeader()}</h2>
                </div>
                <div className="col-md-10">
                    <div className="card">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Uploaded</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><a href='#' onClick={() => navigate({type: 'back'})}> .. </a></td>
                                    <td> - </td>
                                </tr>
                                {folderDisplay.__DIRS__.map((dir) =>
                                    <tr>
                                        <td><a href='#' onClick={() => navigate({type: 'up', folder: dir})}> { dir } </a></td>
                                        <td> - </td>
                                    </tr>
                                )}
                                {folderDisplay.__FILES__.map((file) =>
                                    <tr>
                                        <td><a href={ file.path }> { file.name } </a></td>
                                        <td> { file.created_at.slice(0, 19) } </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
