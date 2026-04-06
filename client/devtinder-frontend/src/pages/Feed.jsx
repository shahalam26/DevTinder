import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import ProfileCard from "../components/ProfileCard";

const SWIPE_THRESHOLD = 80;

const Feed = () => {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [animation, setAnimation] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef(null);

  // Use an effect to handle the initial data fetch
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const res = await api.get("/feed");
        if (isMounted) {
          const userData = Array.isArray(res.data?.data) ? res.data.data : [];
          setUsers(userData);
        }
      } catch (err) {
        if (isMounted) console.error("Error fetching feed:", err);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array means this runs once on mount

  const handleAction = async (direction) => {
  if (animation) return;

  const user = users[currentIndex];

  try {
    if (direction === "right") {
      await api.post("/request/send", {
        toUserId: user._id,
      });
    }
  } catch (err) {
    console.error(err);
  }

  setAnimation(direction);
  setDragX(direction === "right" ? 600 : -600);

  setTimeout(() => {
    setCurrentIndex((prev) => prev + 1);
    setAnimation("");
    setDragX(0);
  }, 300);
};
  const onPointerDown = (e) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    isHorizontal.current = null;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isDragging || animation) return;

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    if (isHorizontal.current === null) {
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        isHorizontal.current = Math.abs(dx) > Math.abs(dy);
      }
      return;
    }

    if (isHorizontal.current) {
      setDragX(dx);
    }
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragX > SWIPE_THRESHOLD) {
      handleAction("right");
    } else if (dragX < -SWIPE_THRESHOLD) {
      handleAction("left");
    } else {
      setDragX(0);
    }
  };

  const currentUser = users[currentIndex];
  const nextUser = users[currentIndex + 1];

  const rotation = dragX * 0.08;
  const opacity = Math.max(0.5, 1 - Math.abs(dragX) / 400);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h2 className="text-2xl font-bold text-gray-500">
          No more developers nearby
        </h2>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen overflow-hidden">
      <div className="relative">
        {nextUser && (
          <div className="absolute inset-0 scale-95 opacity-60 pointer-events-none">
            <ProfileCard
              name={`${nextUser.firstName} ${nextUser.lastName}`}
              age={nextUser.age}
              bio={nextUser.about}
              skills={nextUser.skills}
              image={nextUser.photourl}
              onReject={() => {}}
              onConnect={() => {}}
            />
          </div>
        )}

        <div
          className="relative touch-none cursor-grab active:cursor-grabbing"
          style={{
            transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
            opacity: animation ? 0 : opacity,
            transition: isDragging ? "none" : "transform 0.3s ease, opacity 0.3s ease"
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <ProfileCard
            name={`${currentUser.firstName} ${currentUser.lastName}`}
            age={currentUser.age}
            bio={currentUser.about}
            skills={currentUser.skills}
            image={currentUser.photourl}
            onReject={() => handleAction("left")}
            onConnect={() => handleAction("right")}
          />
        </div>
      </div>
    </div>
  );
};

export default Feed;