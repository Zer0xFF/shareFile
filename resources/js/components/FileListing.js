import React, { useReducer, useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

function FileListing()
{
    const [root, setRootDirectory] = useReducer(parseFileRequest, {isLoaded: false, items: [], tree:{}});
    const [navHistory, setNavigation] = useState([])
    const [folderDisplay, navigate] = useReducer(SetCurentFolder, {__DIRS__: [], __FILES__:[]});
    const [listType, setType] = useState(0);

    function toggleLayout()
    {
        setType(1 - listType);
    }
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

    const header = useCallback(() =>
    {
        switch(listType)
        {
            case 0:
            default:
            return [<> / <a href={'#' + 0} onClick={() => navigate({type: 'root'})}> {window.location.hostname} </a> / </>, ...navHistory.map((path, i) =>
            <> <a href={'#' + (i + 1)} onClick={() => navigate({type: 'set', index: i + 1})}> {path} </a> / </>
            )];
            case 1:
                return document.querySelector("meta[name='site_name']").content;
        }
    }, [listType])()

    const list = useCallback(() =>
    {
        switch(listType)
        {
            case 0:
            default:
                return <>
                    <tr>
                        <td><a className="d-inline-block w-100" href='#' onClick={() => navigate({type: 'back'})}> .. </a></td>
                        <td> - </td>
                    </tr>
                    {folderDisplay.__DIRS__.map((dir) =>
                        <tr>
                            <td><a className="d-inline-block w-100" href='#' onClick={() => navigate({type: 'up', folder: dir})}> { dir } </a></td>
                            <td> - </td>
                        </tr>
                    )}
                    {folderDisplay.__FILES__.map((file) =>
                        <tr>
                            <td><a className="d-inline-block w-100" href={ file.path }> { file.name } </a></td>
                            <td> { file.created_at.slice(0, 19).replace("T", " ") } </td>
                        </tr>
                    )}
                </>
            case 1:
                return root.items.map((file) =>
                    <tr>
                        <td><a className="d-inline-block w-100" href={ file.path }> { file.path } </a></td>
                        <td> { file.created_at.slice(0, 19).replace("T", " ") } </td>
                    </tr>
                )
        }
    }, [listType, folderDisplay])()


    return (
        <div className="container">
            <div className="float_container" onClick={() => toggleLayout()}>
                <svg className="svg-inline--fa fa-list fa-w-16 fa-3x" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="list" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" ><path fill="currentColor" d="M80 368H16a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16zm0-320H16A16 16 0 0 0 0 64v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16zm0 160H16a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16zm416 176H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-320H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm0 160H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z"></path></svg>
            </div>
            <div className="flex header"></div>
            <div className="flex body row justify-content-center">
                <div className="col-md-10">
                    <h2>{header}</h2>
                </div>
                <div className="col-md-10">
                    <table className="bg-white table mb-0 table-sm table-hover table-bordered wrapbreak">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Uploaded</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list}
                        </tbody>
                    </table>
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
