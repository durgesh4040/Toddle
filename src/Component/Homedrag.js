import React, { useState, useEffect, useRef } from "react";
import ModuleItem from "./ModuleItem";
import PdfItem from "./PdfItem";
import LinkItem from "./LinkItem";
import { FiMoreVertical } from "react-icons/fi";
import AddModule from "./AddModule";
import EditModuleModal from "./EditModuleModal";
import FileUpload from "./FileUpload";
import RenamePdfModal from "./RenamePdfModal";
import AddLinkModal from "./AddLinkModal";

// Utility function to generate unique IDs
const generateUniqueId = () => {
  return `id-${Math.random().toString(36).substr(2, 9)}`;
};

function Home() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modules, setModules] = useState([]);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuOpenType, setMenuOpenType] = useState(null);
  const [editModuleData, setEditModuleData] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [links, setLinks] = useState([]);
  const [renamePdfData, setRenamePdfData] = useState(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [editLinkData, setEditLinkData] = useState(null);

  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null);
        setMenuOpenType(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const openModal = () => {
    setModalOpen(true);
    setDropdownOpen(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditModuleData(null);
  };

  const closeRenameModal = () => {
    setRenameModalOpen(false);
    setRenamePdfData(null);
  };

  const closeLinkModal = () => {
    setLinkModalOpen(false);
    setEditLinkData(null);
  };

  const openLinkModal = () => {
    setLinkModalOpen(true);
    setDropdownOpen(false);
  };

  const addModule = (moduleName) => {
    setModules([
      ...modules,
      { name: moduleName, id: generateUniqueId(), files: [], links: [] },
    ]);
    closeModal();
  };

  const deleteModule = (id) => {
    setModules(modules.filter((module) => module.id !== id));
  };

  const toggleMenu = (id, type) => {
    if (menuOpenId === id && menuOpenType === type) {
      setMenuOpenId(null);
      setMenuOpenType(null);
    } else {
      setMenuOpenId(id);
      setMenuOpenType(type);
    }
  };

  const handleFileUpload = (fileUrl, fileName) => {
    setPdfs([
      ...pdfs,
      { url: fileUrl, name: fileName, id: generateUniqueId() },
    ]);
  };

  const editModule = (id, newName) => {
    setModules(
      modules.map((module) => {
        if (module.id === id) {
          return { ...module, name: newName };
        }
        return module;
      })
    );
  };

  const handleEditModule = (module) => {
    setEditModuleData(module);
    setModalOpen(true);
    setDropdownOpen(false);
  };

  const deletePdf = (id) => {
    setPdfs(pdfs.filter((pdf) => pdf.id !== id));
  };

  const handleRenamePdf = (pdf) => {
    setRenamePdfData(pdf);
    setRenameModalOpen(true);
  };

  const renamePdf = (id, newName) => {
    setPdfs(
      pdfs.map((pdf) => {
        if (pdf.id === id) {
          return { ...pdf, name: newName };
        }
        return pdf;
      })
    );
    closeRenameModal();
  };

  const addLink = (link) => {
    if (editLinkData) {
      setLinks(
        links.map((l) => (l.id === editLinkData.id ? { ...l, ...link } : l))
      );
      setEditLinkData(null);
    } else {
      setLinks([...links, { ...link, id: generateUniqueId() }]);
    }
    closeLinkModal();
  };

  const deleteLink = (id) => {
    setLinks(links.filter((link) => link.id !== id));
  };

  const handleEditLink = (link) => {
    setEditLinkData(link);
    setLinkModalOpen(true);
  };

  const handleDropOnModule = (e, moduleId) => {
    const data = e.dataTransfer.getData("text");
    if (!data) return;
    const parsedData = JSON.parse(data);

    if (parsedData.type === "pdf") {
      setModules((prevModules) =>
        prevModules.map((module) => {
          if (module.id === moduleId) {
            return { ...module, files: [...module.files, parsedData.item] };
          }
          return module;
        })
      );
      setPdfs(pdfs.filter((p) => p.id !== parsedData.item.id));
    } else if (parsedData.type === "link") {
      setModules((prevModules) =>
        prevModules.map((module) => {
          if (module.id === moduleId) {
            return { ...module, links: [...module.links, parsedData.item] };
          }
          return module;
        })
      );
      setLinks(links.filter((l) => l.id !== parsedData.item.id));
    }
  };

  const handleDragStart = (e, item, type) => {
    e.dataTransfer.setData("text", JSON.stringify({ type, item }));
  };

  const moveModule = (id, direction) => {
    const index = modules.findIndex((module) => module.id === id);
    if (index === -1) return;

    const newModules = [...modules];
    const [removed] = newModules.splice(index, 1);
    if (direction === "up" && index > 0) {
      newModules.splice(index - 1, 0, removed);
    } else if (direction === "down" && index < modules.length - 1) {
      newModules.splice(index + 1, 0, removed);
    }
    setModules(newModules);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
        <div className="absolute top-4 left-4 sm:left-16">
          <span className="text-xl sm:text-2xl font-bold text-gray-700">
            Course Builder
          </span>
        </div>
        <div className="absolute top-4 right-4 sm:right-16">
          <button
            onClick={toggleDropdown}
            className="relative bg-red-500 text-white py-2 px-4 rounded"
          >
            + Add ^
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
              <a
                href="#"
                onClick={openModal}
                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
              >
                🧾Create module
              </a>
              <a
                href="#"
                onClick={openLinkModal}
                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
              >
                🔗Add a link
              </a>
              <FileUpload onUpload={handleFileUpload} />
            </div>
          )}
        </div>
        <div className="w-full max-w-4xl mx-auto mt-4">
          {modules.length === 0 && pdfs.length === 0 && links.length === 0 ? (
            <div className="text-center">
              <img
                src="images/box_image1.png"
                alt="box image"
                className="mx-auto mb-4 w-64 h-48 sm:w-[272px] sm:h-[192px]"
              />
              <p className="text-xl sm:text-2xl font-bold text-gray-700">
                Nothing added here yet.
              </p>
              <p className="text-base sm:text-lg">
                Click on the [+] Add button to add items to this course
              </p>
            </div>
          ) : (
            <>
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  onDrop={(e) => handleDropOnModule(e, module.id)}
                  onDragOver={(e) => e.preventDefault()}
                  className="p-4 border border-gray-200 rounded-md mb-4"
                >
                  <ModuleItem
                    module={module}
                    onEdit={handleEditModule}
                    onDelete={deleteModule}
                    onToggleMenu={toggleMenu}
                    menuOpen={
                      menuOpenId === module.id && menuOpenType === "module"
                    }
                    onMoveUp={() => moveModule(module.id, "up")}
                    onMoveDown={() => moveModule(module.id, "down")}
                    isFirst={index === 0}
                    isLast={index === modules.length - 1}
                  />
                  {module.files.map((file, index) => (
                    <PdfItem
                      key={index}
                      pdf={file}
                      onRename={handleRenamePdf}
                      onDelete={deletePdf}
                      onToggleMenu={toggleMenu}
                      menuOpen={
                        menuOpenId === file.id && menuOpenType === "pdf"
                      }
                      onDragStart={(e) => handleDragStart(e, file, "pdf")}
                    />
                  ))}
                  {module.links.map((link, index) => (
                    <LinkItem
                      key={index}
                      link={link}
                      onEdit={handleEditLink}
                      onDelete={deleteLink}
                      onToggleMenu={toggleMenu}
                      menuOpen={
                        menuOpenId === link.id && menuOpenType === "link"
                      }
                      onDragStart={(e) => handleDragStart(e, link, "link")}
                    />
                  ))}
                </div>
              ))}
              {links.map((link) => (
                <LinkItem
                  key={link.id}
                  link={link}
                  onEdit={handleEditLink}
                  onDelete={deleteLink}
                  onToggleMenu={toggleMenu}
                  menuOpen={menuOpenId === link.id && menuOpenType === "link"}
                  onDragStart={(e) => handleDragStart(e, link, "link")}
                />
              ))}
              {pdfs.map((pdf) => (
                <PdfItem
                  key={pdf.id}
                  pdf={pdf}
                  onRename={handleRenamePdf}
                  onDelete={deletePdf}
                  onToggleMenu={toggleMenu}
                  menuOpen={menuOpenId === pdf.id && menuOpenType === "pdf"}
                  onDragStart={(e) => handleDragStart(e, pdf, "pdf")}
                />
              ))}
            </>
          )}
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">
              {editModuleData ? "Edit Module" : "Add Module"}
            </h2>
            <AddModule
              isOpen={modalOpen}
              onClose={closeModal}
              addModule={addModule}
            />
            {editModuleData && (
              <EditModuleModal
                isOpen={modalOpen}
                onClose={closeModal}
                editModule={editModule}
                moduleToEdit={editModuleData}
              />
            )}
          </div>
        </div>
      )}
      <RenamePdfModal
        isOpen={renameModalOpen}
        onClose={closeRenameModal}
        renamePdf={renamePdf}
        pdfToRename={renamePdfData}
      />
      <AddLinkModal
        isOpen={linkModalOpen}
        onClose={closeLinkModal}
        addLink={addLink}
        editLinkData={editLinkData}
      />
    </>
  );
}

export default Home;